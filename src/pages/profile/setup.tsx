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
import {
  trackFTUECompletion,
  trackFTUEStep,
  trackProfileCompletion,
} from "../../utils/mixpanel";
import { useUploadFile } from "../../utils/profile/useUploadFile";
import { ComplianceModal } from "../../components/CompliancePortal";
import { useAddressSelection } from "../../utils/useAddressSelection";
import {
  updateUser,
  useEditUserMutation,
} from "../../utils/profile/updateUser";
import useIsMobile from "../../utils/useIsMobile";

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
  if (session?.user.isOnboarded) {
    return {
      redirect: {
        destination: "/profile",
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
  const isMobile = useIsMobile(); // Use the hook to detect mobile

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
    setIsLoading(false),
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
    setError,
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
  const role = watch("role");

  useEffect(() => {
    const seatAvail = watch("seatAvail");
    if (role === Role.DRIVER && (seatAvail ?? 0) <= 0) {
      setValue("seatAvail", 1);
    } else if (role !== Role.DRIVER) {
      setValue("seatAvail", 0);
    }
  }, [setValue, watch, role]);

  const onSubmit = async (values: OnboardingFormInputs) => {
    setIsLoading(true);
    const userInfo = {
      ...values,
      companyCoordLng: companyAddressHook.selectedAddress.center[0],
      companyCoordLat: companyAddressHook.selectedAddress.center[1],
      startCoordLng: startAddressHook.selectedAddress.center[0],
      startCoordLat: startAddressHook.selectedAddress.center[1],
      seatAvail: values.role === "RIDER" ? 0 : (values.seatAvail ?? 1),
      startStreet: startAddressHook.selectedAddress.street || "",
      startCity: startAddressHook.selectedAddress.city || "",
      startState: startAddressHook.selectedAddress.state || "",
      companyStreet: companyAddressHook.selectedAddress.street || "",
      companyCity: companyAddressHook.selectedAddress.city || "",
      companyState: companyAddressHook.selectedAddress.state || "",
      companyName: values.companyName ?? "",
      profilePicture: values.profilePicture ?? "",
      companyAddress: values.companyAddress ?? "",
      startAddress: values.startAddress ?? "",
      preferredName: values.preferredName ?? "",
      pronouns: values.pronouns ?? "",
      bio: values.bio ?? "",
      daysWorking: values.daysWorking ?? [],
      startTime: values.startTime ?? null,
      endTime: values.endTime ?? null,
      coopStartDate: values.coopStartDate ?? null,
      coopEndDate: values.coopEndDate ?? null,
    };
    console.log(userInfo);
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
    trackFTUECompletion(userInfo.role);
  };

  const handleNextStep = async () => {
    const seatAvail = watch("seatAvail");
    if (step === 1) {
      if (role === Role.VIEWER) {
        await handleSubmit(onSubmit)();
        return;
      }
      if (role === Role.DRIVER && (!seatAvail || seatAvail <= 0)) {
        setError("seatAvail", {
          type: "manual",
          message: "Seat availability must be > 0",
        });
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
    trackFTUEStep(step);
    setStep((prevStep) => prevStep + 1);
  };
  if (isLoading || !user) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
        <Spinner />
      </div>
    );
  }

  // Responsive classes based on isMobile
  const buttonContainerClass = isMobile
    ? "fixed left-1/2 bottom-6 transform -translate-x-1/2 flex flex-col items-center gap-3 z-50"
    : "absolute left-1/2 bottom-10 transform -translate-x-1/2 flex flex-col items-center gap-6";

  const backButtonClass = isMobile
    ? "px-4 py-2 font-montserrat text-base text-black underline"
    : "px-6 py-3 font-montserrat text-lg text-black underline";

  const continueBaseClass = isMobile
    ? "flex w-[170px] items-center justify-center rounded-full drop-shadow-[0_10px_3px_rgba(0,0,0,0.35)]"
    : "flex w-[200px] items-center justify-center rounded-full drop-shadow-[0_15px_4px_rgba(0,0,0,0.35)]";

  const continueButtonDefaultClass = isMobile
    ? "bg-white text-black px-4 py-2"
    : "bg-white text-black px-6 py-3";

  const continueButtonFinalStepClass = isMobile
    ? "bg-northeastern-red text-white px-4 py-2"
    : "bg-northeastern-red text-white px-6 py-3";

  // Responsive title classes
  const titleClass = isMobile
    ? "absolute z-10 w-full justify-start p-3 font-lato text-3xl font-bold text-northeastern-red transition-opacity duration-1000"
    : "absolute z-10 w-full justify-start p-4 font-lato text-5xl font-bold text-northeastern-red transition-opacity duration-1000";

  // Container padding based on step and device
  const containerPadding = () => {
    if (step < 2) {
      return isMobile
        ? "rounded-2xl bg-white px-6 py-10 drop-shadow-[0_15px_8px_rgba(0,0,0,0.35)]"
        : "rounded-2xl bg-white px-16 py-20 drop-shadow-[0_15px_8px_rgba(0,0,0,0.35)]";
    } else {
      return isMobile
        ? "rounded-2xl bg-white px-4 py-6 drop-shadow-[0_15px_8px_rgba(0,0,0,0.35)]"
        : "rounded-2xl bg-white drop-shadow-[0_15px_8px_rgba(0,0,0,0.35)]";
    }
  };

  // Mobile heights for different steps
  const mobileHeights = {
    0: 500,
    1: 700,
    2: 580,
    3: 700,
    4: 700,
  };

  return (
    <div className="relative h-full w-full overflow-hidden">
      {!user?.licenseSigned && <ComplianceModal />}
      <div className="absolute inset-0 bg-floaty" />
      <h1 className={titleClass}>CarpoolNU</h1>

      {step > 1 && (
        <div
          className={`absolute left-1/2 ${isMobile ? "top-16" : "top-[calc(50%-250px-60px)]"} -translate-x-1/2 transform z-20`}
        >
          <ProgressBar step={step - 2} />
        </div>
      )}

      {/* Full screen flex container for perfect centering */}
      <div className="fixed inset-0 flex items-center justify-center">
        <SetupContainer
          className={`${containerPadding()} ${isMobile ? "w-[90%]" : ""} overflow-y-auto`}
          style={
            isMobile
              ? {
                  height: `${mobileHeights[step as keyof typeof mobileHeights]}px`,
                  maxHeight: "85vh",
                }
              : undefined
          }
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
            <div
              className={`relative z-0 ${isMobile ? "scale-95 transform" : ""}`}
            >
              <StepTwo
                control={control}
                register={register}
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
              watch={watch}
              onFileSelect={setSelectedFile}
              errors={errors}
              register={register}
            />
          )}
        </SetupContainer>
      </div>

      {step > 0 && (
        <div className={buttonContainerClass}>
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
            className={`${continueBaseClass} ${
              step === 4 || watch("role") === Role.VIEWER
                ? continueButtonFinalStepClass
                : continueButtonDefaultClass
            }`}
            onClick={handleNextStep}
          >
            <div
              className={`flex items-center font-montserrat ${isMobile ? "text-xl" : "text-2xl"} font-bold`}
            >
              {watch("role") === Role.VIEWER
                ? "View Map"
                : step === 4
                  ? "Complete"
                  : "Continue"}
              {step !== 4 && watch("role") !== Role.VIEWER && (
                <FaArrowRight
                  className={`${isMobile ? "ml-1" : "ml-2"} text-black`}
                />
              )}
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default Setup;
