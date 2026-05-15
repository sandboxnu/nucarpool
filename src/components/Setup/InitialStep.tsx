import { OnboardingFormInputs } from "../../utils/types";
import {
  UseFormWatch,
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
} from "react-hook-form";
import { Role } from "@prisma/client";
import { TextField } from "../TextField";
import useIsMobile from "../../utils/useIsMobile";

import FormRadioButton from "./FormRadioButton";
interface InitialStepProps {
  handleNextStep: () => void;
  step: number;
  register: UseFormRegister<OnboardingFormInputs>;
  errors: FieldErrors<OnboardingFormInputs>;
  watch: UseFormWatch<OnboardingFormInputs>;
}

const InitialStep = ({
  handleNextStep,
  step,
  register,
  errors,
  watch,
}: InitialStepProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="flex select-none flex-col items-center">
      <h2
        className={`mb-2 text-center font-montserrat ${isMobile ? "text-4xl" : "text-5xl"} font-bold`}
      >
        Welcome to{" "}
      </h2>
      <h2
        className={`mb-4 text-center font-montserrat ${isMobile ? "text-4xl" : "text-5xl"} font-bold text-northeastern-red`}
      >
        CarpoolNU
      </h2>
      {step === 0 && (
        <button
          onClick={handleNextStep}
          className={`${isMobile ? "mt-12" : "mt-16"} rounded-lg border border-black bg-northeastern-red px-6 py-2 font-montserrat ${isMobile ? "text-xl" : "text-2xl"} text-white transition hover:bg-red-700`}
        >
          Get Started
        </button>
      )}
      {isMobile && (
        <div className="mt-4 w-full rounded-md bg-amber-50 p-2 text-center">
          <p className="text-xs font-medium text-amber-800">
            ⚠️ Mobile version is currently under development. Some features are
            only available on Desktop
          </p>
        </div>
      )}
      {step === 1 && (
        <div className="mt-4 flex flex-col items-center justify-center">
          <h3
            className={`mb-3 font-montserrat ${isMobile ? "text-l" : "text-2xl"} font-semibold`}
          >
            Please select a role to start:
          </h3>

          <div
            className={`flex justify-between ${isMobile ? "space-x-3" : "space-x-6"}`}
          >
            {!isMobile && (
              <FormRadioButton
                label="Viewer"
                id="viewer"
                error={errors.role}
                role={Role.VIEWER}
                value={Role.VIEWER}
                currentlySelected={watch("role")}
                {...register("role")}
              />
            )}
            <FormRadioButton
              label="Rider"
              id="rider"
              error={errors.role}
              role={Role.RIDER}
              value={Role.RIDER}
              currentlySelected={watch("role")}
              {...register("role")}
            />
            <FormRadioButton
              label="Driver"
              id="driver"
              error={errors.role}
              role={Role.DRIVER}
              value={Role.DRIVER}
              currentlySelected={watch("role")}
              {...register("role")}
            />
          </div>
          <p
            className={`pt-3 font-montserrat ${isMobile ? "text-base" : "text-lg"}`}
          >
            {watch("role") === Role.DRIVER && (
              <span>Looking for Carpoolers to join you.</span>
            )}
            {watch("role") === Role.RIDER && (
              <span>Looking for a Carpool to join.</span>
            )}
            {watch("role") === Role.VIEWER && (
              <span> View the map and change your role later!</span>
            )}
          </p>
          {watch("role") === Role.DRIVER && (
            <div className="mt-2 flex flex-1 items-center justify-center gap-3">
              <div className="flex flex-col">
                <div className="flex items-center justify-center">
                  <span
                    className={`mr-2 font-montserrat ${isMobile ? "text-base" : "text-lg"} font-semibold`}
                  >
                    Seat Availability
                  </span>
                  <TextField
                    className="!w-1/5"
                    label="Seat Availability"
                    id="seatAvail"
                    type="number"
                    min="1"
                    defaultValue={1}
                    {...register("seatAvail", { valueAsNumber: true })}
                  />
                </div>
                {errors.seatAvail && (
                  <span className="mt-1 text-center text-sm text-northeastern-red">
                    Enter a number between 1 and 6
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InitialStep;
