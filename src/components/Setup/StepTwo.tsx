import { OnboardingFormInputs } from "../../utils/types";
import { FieldErrors, UseFormRegister, Control } from "react-hook-form";
import { ErrorDisplay, Note } from "../../styles/profile";

import { EntryLabel } from "../EntryLabel";
import ControlledAddressCombobox from "../Profile/ControlledAddressCombobox";
import { TextField } from "../TextField";
import { useAddressSelection } from "../../utils/useAddressSelection";

interface StepTwoProps {
  register: UseFormRegister<OnboardingFormInputs>;
  errors: FieldErrors<OnboardingFormInputs>;
  control: Control<OnboardingFormInputs>;
  startAddressHook: ReturnType<typeof useAddressSelection>;
  companyAddressHook: ReturnType<typeof useAddressSelection>;
}
const StepTwo = ({
  register,
  errors,
  control,
  startAddressHook,
  companyAddressHook,
}: StepTwoProps) => {
  return (
    <div className="flex flex-col items-center  justify-center bg-white px-4">
      <div className="mb-8 text-center font-montserrat text-3xl font-bold">
        <span>Where are you&nbsp;</span>
        <span className="text-northeastern-red">carpooling?</span>
      </div>
      <div className="space-y-2 text-start ">
        {/* Home Address */}
        <EntryLabel
          required={true}
          error={errors.startAddress}
          label="Start Address"
        />

        <ControlledAddressCombobox
          isDisabled={false}
          control={control}
          name="startAddress"
          addressSelected={startAddressHook.selectedAddress}
          addressSetter={startAddressHook.setSelectedAddress}
          addressSuggestions={startAddressHook.suggestions}
          error={errors.startAddress}
          addressUpdater={startAddressHook.updateAddress}
        />
        <Note className="pt-2">
          Note: Your address will only be used to find users close to you. It
          will not be displayed to any other users.
        </Note>
        {errors.startAddress && (
          <ErrorDisplay>{errors.startAddress.message}</ErrorDisplay>
        )}

        {/* Workplace Name */}
        <EntryLabel
          required={true}
          error={errors.companyName}
          label="Workplace Name"
        />
        <TextField
          className="w-full"
          inputClassName="h-12"
          label="Workplace Name"
          isDisabled={false}
          id="companyName"
          error={errors.companyName}
          type="text"
          {...register("companyName")}
        />

        {/* Workplace Address */}
        <div
          className={`${
            !errors.companyName && !errors.companyAddress && "pt-4"
          }`}
        >
          <EntryLabel
            required={true}
            error={errors.companyAddress}
            label="Workplace Address"
          />
          <ControlledAddressCombobox
            isDisabled={false}
            control={control}
            name="companyAddress"
            addressSelected={companyAddressHook.selectedAddress}
            addressSetter={companyAddressHook.setSelectedAddress}
            addressSuggestions={companyAddressHook.suggestions}
            error={errors.companyAddress}
            addressUpdater={companyAddressHook.updateAddress}
          />
          {errors.companyAddress && (
            <ErrorDisplay>{errors.companyAddress.message}</ErrorDisplay>
          )}
        </div>
      </div>
    </div>
  );
};

export default StepTwo;
