import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GetServerSidePropsContext, NextPage } from "next";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { getSession, useSession } from "next-auth/react";
import { trpc } from "../../utils/trpc";
import { CarpoolAddress, OnboardingFormInputs } from "../../utils/types";
import {
  onboardSchema,
  profileDefaultValues,
} from "../../utils/profile/zodSchema";

import Spinner from "../../components/Spinner";
import InitialStep from "../../components/Setup/InitialStep";
import { FaArrowRight } from "react-icons/fa";
import StepTwo from "../../components/Setup/StepTwo";
import ProgressBar from "../../components/Setup/ProgressBar";
import StepThree from "../../components/Setup/StepThree";
import { SetupContainer } from "../../components/Setup/SetupContainer";
import StepFour from "../../components/Setup/StepFour";
import { Role } from "@prisma/client";
import { trackProfileCompletion } from "../../utils/mixpanel";
import { useUploadFile } from "../../utils/profile/useUploadFile";
import { ComplianceModal } from "../../components/CompliancePortal";
import { useAddressSelection } from "../../utils/useAddressSelection";
import {
  updateUser,
  useEditUserMutation,
} from "../../utils/profile/updateUser";

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getSession(context);
  if (!session?.user) {
    return {
      redirect: {
        destination: "/sign-in",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
}
const Setup: NextPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [initialLoad, setInitialLoad] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { uploadFile } = useUploadFile(selectedFile);
  const { data: session } = useSession();
  const { data: user } = trpc.user.me.useQuery(undefined, {
    refetchOnMount: true,
  });
  const editUserMutation = useEditUserMutation(router, () =>
    setIsLoading(false)
  );
  const startAddressHook = useAddressSelection();
  const companyAddressHook = useAddressSelection();

  const { setSelectedAddress: setStartAddressSelected } = startAddressHook;
  const { setSelectedAddress: setCompanyAddressSelected } = companyAddressHook;

  useEffect(() => {
    if (user?.startAddress && user.startAddress !== "") {
      setStartAddressSelected({
        place_name: user.startAddress,
        center: [user.startCoordLng, user.startCoordLat],
      });
    }
    if (user?.companyAddress && user.companyAddress !== "") {
      setCompanyAddressSelected({
        place_name: user.companyAddress,
        center: [user.companyCoordLng, user.companyCoordLat],
      });
    }
  }, [user, setStartAddressSelected, setCompanyAddressSelected]);

  const {
    register,
    setValue,
    formState: { errors },
    watch,
    handleSubmit,
    reset,
    control,
    trigger,
  } = useForm<OnboardingFormInputs>({
    mode: "onChange",
    defaultValues: profileDefaultValues,
    resolver: zodResolver(onboardSchema),
  });

  useEffect(() => {
    if (initialLoad && user) {
      reset({
        role: user.role,
        seatAvail: user.seatAvail,
        status: user.status,
        companyName: user.companyName,
        companyAddress: user.companyAddress,
        startAddress: user.startAddress,
        preferredName: user.preferredName,
        pronouns: user.pronouns,
        daysWorking: user.daysWorking
          ? user.daysWorking.split(",").map((bit) => bit === "1")
          : profileDefaultValues.daysWorking,
        startTime: user.startTime!,
        endTime: user.endTime!,
        coopStartDate: user.coopStartDate!,
        coopEndDate: user.coopEndDate!,
        bio: user.bio,
      });
      setInitialLoad(false);
    }
  }, [initialLoad, reset, user]);

  const onSubmit = async (values: OnboardingFormInputs) => {
    setIsLoading(true);
    const userInfo = {
      ...values,
      companyCoordLng: companyAddressHook.selectedAddress.center[0],
      companyCoordLat: companyAddressHook.selectedAddress.center[1],
      startCoordLng: startAddressHook.selectedAddress.center[0],
      startCoordLat: startAddressHook.selectedAddress.center[1],
      seatAvail: values.role === "RIDER" ? 0 : values.seatAvail,
    };
    if (selectedFile) {
      try {
        await uploadFile();
      } catch (error) {
        console.error("File upload failed:", error);
      }
    }
    const sessionName = session?.user?.name ?? "";
    await updateUser({
      userInfo,
      sessionName,
      mutation: editUserMutation,
    });
    trackProfileCompletion(userInfo.role, userInfo.status);
  };

  const handleNextStep = async () => {
    const role = watch("role");
    if (step === 1) {
      if (role === Role.VIEWER) {
        await handleSubmit(onSubmit)();
        return;
      }
      const isValid = await trigger(["seatAvail"]);
      if (!isValid) return;
    } else if (step === 2) {
      const isValid = await trigger([
        "startAddress",
        "companyAddress",
        "companyName",
      ]);
      if (!isValid) return;
    } else if (step === 3) {
      const valid = await trigger([
        "coopStartDate",
        "daysWorking",
        "coopEndDate",
        "startTime",
        "endTime",
      ]);
      if (!valid) return;
    } else if (step === 4) {
      const valid = await trigger(["bio", "preferredName", "pronouns"]);
      if (!valid) return;
      await handleSubmit(onSubmit)();
      return;
    }
    setStep((prevStep) => prevStep + 1);
  };
  if (isLoading || !user) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white ">
        <Spinner />
      </div>
    );
  }
  const buttonBaseClass =
    "absolute z-0 flex w-[200px] items-center justify-center rounded-full drop-shadow-[0_15px_4px_rgba(0,0,0,0.35)]";
  const backButtonClass =
    "absolute left-1/4 top-[calc(50%+250px+20px)] z-0 -translate-x-1/2 px-4 py-2 items-center justify-center font-montserrat font-semibold text-2xl text-stone-500 underline";
  const continueButtonDefaultClass = "bg-white text-black";
  const continueButtonFinalStepClass = "bg-northeastern-red text-white";
  const continueButtonCenterClass =
    "left-1/2 -translate-x-1/2 top-[calc(50%+250px+20px)]";
  const continueButtonRightClass =
    "left-3/4 -translate-x-1/2 top-[calc(50%+250px+20px)]";

  return (
    <div className="relative h-full w-full overflow-hidden ">
      {!user?.licenseSigned && <ComplianceModal />}
      <div className="absolute inset-0  animate-gradientShift bg-floaty"></div>
      <h1 className="absolute z-10 w-full justify-start p-4 font-lato text-5xl font-bold text-northeastern-red transition-opacity duration-1000">
        CarpoolNU
      </h1>
      {step > 1 && (
        <div className="absolute left-1/2 top-[calc(50%-250px-60px)] -translate-x-1/2 transform">
          <ProgressBar step={step - 2} />
        </div>
      )}
      <SetupContainer
        className={`${
          step < 2
            ? "rounded-2xl bg-white px-16 py-20  drop-shadow-[0_15px_8px_rgba(0,0,0,0.35)]"
            : "rounded-2xl bg-white  drop-shadow-[0_15px_8px_rgba(0,0,0,0.35)]"
        } absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform`}
      >
        {(step === 0 || step == 1) && (
          <InitialStep
            handleNextStep={handleNextStep}
            step={step}
            errors={errors}
            register={register}
            watch={watch}
          />
        )}
        {step === 2 && (
          <div className="relative z-0">
            <StepTwo
              control={control}
              register={register}
              watch={watch}
              errors={errors}
              startAddressHook={startAddressHook}
              companyAddressHook={companyAddressHook}
            />
          </div>
        )}
        {step === 3 && (
          <StepThree
            control={control}
            user={user}
            watch={watch}
            errors={errors}
            setValue={setValue}
          />
        )}
        {step === 4 && (
          <StepFour
            setValue={setValue}
            onFileSelect={setSelectedFile}
            errors={errors}
            register={register}
          />
        )}
      </SetupContainer>

      {step > 0 && (
        <>
          {step > 1 && (
            <button
              type="button"
              className={backButtonClass}
              onClick={() => setStep((prevStep) => Math.max(prevStep - 1, 0))}
            >
              Previous
            </button>
          )}
          <button
            type="button"
            className={`${buttonBaseClass} ${
              step === 1 ? continueButtonCenterClass : continueButtonRightClass
            } ${
              step === 4 || watch("role") === Role.VIEWER
                ? continueButtonFinalStepClass
                : continueButtonDefaultClass
            }`}
            onClick={handleNextStep}
          >
            <div className="z-0 flex items-center px-4 py-2 font-montserrat text-2xl font-bold">
              {watch("role") === Role.VIEWER
                ? "View Map"
                : step === 4
                ? "Complete"
                : "Continue"}
              {step !== 4 && watch("role") !== Role.VIEWER && (
                <FaArrowRight className="ml-2 text-black" />
              )}
            </div>
          </button>
        </>
      )}
    </div>
  );
};

export default Setup;
