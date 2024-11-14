import React, { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GetServerSideProps, GetServerSidePropsContext, NextPage } from "next";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import { z } from "zod";
import { trpc } from "../../utils/trpc";
import { OnboardingFormInputs } from "../../utils/types";
import {
  onboardSchema,
  profileDefaultValues,
} from "../../utils/profile/zodSchema";
import { useUploadFile } from "../../utils/profile/useUploadFile";
import useSearch from "../../utils/search";
import ControlledAddressCombobox from "../../components/Profile/ControlledAddressCombobox";
import ProfilePicture from "../../components/Profile/ProfilePicture";
import Spinner from "../../components/Spinner";
import { trackProfileCompletion } from "../../utils/mixpanel";

import { Logo } from "../../components/Header";
import InitialStep from "../../components/Setup/InitialStep";
import { FaArrowRight } from "react-icons/fa";
import StepTwo from "../../components/Setup/StepTwo";
import ProgressBar from "../../components/Setup/ProgressBar";
import StepThree from "../../components/Setup/StepThree";

const Setup: NextPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [initialLoad, setInitialLoad] = useState(true);

  const utils = trpc.useContext();

  const { data: user } = trpc.user.me.useQuery(undefined, {
    refetchOnMount: true,
  });

  const {
    register,
    setValue,
    formState: { errors },
    watch,
    handleSubmit,
    reset,
    control,
    getValues,
    trigger,
  } = useForm<OnboardingFormInputs>({
    mode: "onSubmit",
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
        daysWorking: user.daysWorking.split(",").map((bit) => bit === "1"),
        startTime: user.startTime,
        endTime: user.endTime,
        coopStartDate: user.coopStartDate!,
        coopEndDate: user.coopEndDate!,
        timeDiffers: false,
        bio: user.bio,
      });
      setInitialLoad(false);
    }
  }, [initialLoad, reset, user]);

  const onSubmit = async (values: OnboardingFormInputs) => {
    // Process final form submission, similar to profile
  };

  const handleNextStep = async () => {
    console.log("clicked");
    if (step === 2) {
      const valid = await trigger([
        "startAddress",
        "companyAddress",
        "companyName",
      ]);
      console.log(valid);
      console.log(getValues("startAddress"));
      if (!valid) return;
    } else if (step === 3) {
      const valid = await trigger([
        "coopStartDate",
        "daysWorking",
        "coopEndDate",
        "startTime",
        "endTime",
      ]);
      if (!valid) return;
    }
    setStep((prevStep) => prevStep + 1);
  };
  console.log(step);
  return (
    <div className="relative flex h-full w-full flex-col items-center">
      {/* Background layer for step 0 */}
      <div
        className={`absolute inset-0 bg-setup-gradient transition-opacity duration-1000 ease-in-out ${
          step === 0 ? "opacity-100" : "opacity-0"
        }`}
      ></div>
      {/* Background layer for step 1 */}
      <div
        className={`absolute inset-0 bg-setup-gradient2 transition-opacity duration-1000 ease-in-out ${
          step === 1 ? "opacity-100" : "opacity-0"
        }`}
      ></div>
      <div
        className={`absolute inset-0 bg-white transition-opacity duration-1000 ease-in-out ${
          step > 1 ? "opacity-100" : "opacity-0"
        }`}
      ></div>
      <h1
        className={` absolute z-10 w-full justify-start p-4 font-lato text-5xl font-bold text-white transition-opacity duration-1000 ${
          step < 2 ? "opacity-100" : "opacity-0"
        }`}
      >
        CarpoolNU
      </h1>

      <h1
        className={` absolute z-10 w-full justify-start p-4 font-lato text-5xl font-bold text-northeastern-red transition-opacity duration-1000 ${
          step >= 2 ? "opacity-100" : "opacity-0"
        }`}
      >
        CarpoolNU
      </h1>
      {step > 1 && <ProgressBar step={step - 2} />}
      <div className="absolute inset-0 flex flex-col items-center  justify-center">
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
          <StepTwo
            control={control}
            user={user}
            register={register}
            watch={watch}
            errors={errors}
          />
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
        {step > 0 && (
          <button
            className="mt-10 rounded-full bg-white drop-shadow-[0_15px_4px_rgba(0,0,0,0.35)]"
            onClick={handleNextStep}
          >
            <div className="flex flex-row items-center  px-4 py-2 font-montserrat text-2xl font-bold ">
              Continue
              <FaArrowRight color="black" className="ml-2" />
            </div>
          </button>
        )}
        {isLoading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
            <Spinner />
          </div>
        )}
      </div>
    </div>
  );
};

export default Setup;
