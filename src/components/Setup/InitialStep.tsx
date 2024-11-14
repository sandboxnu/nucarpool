import { OnboardingFormInputs } from "../../utils/types";
import { UseFormWatch, FieldErrors, UseFormRegister } from "react-hook-form";
import Radio from "../../components/Radio";
import { Role } from "@prisma/client";
import { EntryLabel } from "../EntryLabel";
import { TextField } from "../TextField";

import { Note } from "../../styles/profile";
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
  return (
    <div className="flex flex-col items-center">
      <h2 className="mb-4 text-center font-montserrat text-6xl font-bold">
        Welcome to{" "}
      </h2>
      <h2 className="mb-4 text-center font-montserrat text-6xl font-bold text-northeastern-red">
        CarpoolNU
      </h2>
      {step === 0 && (
        <button
          onClick={handleNextStep}
          className="mt-20 rounded-lg border border-black bg-northeastern-red px-8 py-2 font-montserrat text-2xl text-white transition hover:bg-red-700"
        >
          Get Started
        </button>
      )}
      {step === 1 && (
        <div className="mt-5 flex flex-col items-center justify-center">
          <h3 className="mb-4 font-montserrat text-2xl font-semibold">
            Please select a role to start:
          </h3>

          <div className="flex justify-between space-x-6">
            <FormRadioButton
              label="Viewer"
              id="viewer"
              error={errors.role}
              role={Role.VIEWER}
              value={Role.VIEWER}
              currentlySelected={watch("role")}
              {...register("role")}
            />
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

          {watch("role") === Role.DRIVER && (
            <div className="mt-4 flex flex-1 flex-col">
              <EntryLabel error={errors.seatAvail} label="Seat availability" />
              <TextField
                inputClassName="py-2 px-4 text-lg !appearance-none !bg-red !font-montserrat"
                label="Seat Availability"
                id="seatAvail"
                error={errors.seatAvail}
                type="number"
                min="0"
                {...register("seatAvail", { valueAsNumber: true })}
              />
            </div>
          )}

          <p className="pt-4 font-montserrat text-lg">
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
        </div>
      )}
    </div>
  );
};

export default InitialStep;
