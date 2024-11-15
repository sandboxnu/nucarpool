import { CarpoolAddress, OnboardingFormInputs } from "../../utils/types";
import {
  UseFormWatch,
  FieldErrors,
  UseFormRegister,
  Control,
} from "react-hook-form";
import { ErrorDisplay, Note } from "../../styles/profile";

import { EntryLabel } from "../EntryLabel";
import ControlledAddressCombobox from "../Profile/ControlledAddressCombobox";
import { TextField } from "../TextField";
import { useAddressSelection } from "../../utils/useAddressSelection";
import { User } from "@prisma/client";
import { useEffect, useState } from "react";

interface StepTwoProps {
  register: UseFormRegister<OnboardingFormInputs>;
  errors: FieldErrors<OnboardingFormInputs>;
  watch: UseFormWatch<OnboardingFormInputs>;
  control: Control<OnboardingFormInputs>;
  user?: User;
  onAddressChange: (addresses: {
    startAddressSelected: CarpoolAddress | null;
    companyAddressSelected: CarpoolAddress | null;
  }) => void;
}
const StepTwo = ({
  register,
  errors,
  user,
  control,
  onAddressChange,
}: StepTwoProps) => {
  const [hasInitialized, setHasInitialized] = useState(false);

  const {
    selectedAddress: startAddressSelected,
    setSelectedAddress: setStartAddressSelected,
    updateAddress: updateStartingAddress,
    suggestions: startAddressSuggestions,
  } = useAddressSelection();

  const {
    selectedAddress: companyAddressSelected,
    setSelectedAddress: setCompanyAddressSelected,
    updateAddress: updateCompanyAddress,
    suggestions: companyAddressSuggestions,
  } = useAddressSelection();
  useEffect(() => {
    if (user && !hasInitialized) {
      setStartAddressSelected({
        place_name: user.startAddress,
        center: [user.startCoordLng, user.startCoordLat],
      });
      setCompanyAddressSelected({
        place_name: user.companyAddress,
        center: [user.companyCoordLng, user.companyCoordLat],
      });
      setHasInitialized(true);
    }
  }, [
    user,
    hasInitialized,
    setStartAddressSelected,
    setCompanyAddressSelected,
  ]);
  useEffect(() => {
    if (
      startAddressSelected?.place_name !== "" &&
      companyAddressSelected?.place_name !== ""
    ) {
      onAddressChange({
        startAddressSelected,
        companyAddressSelected,
      });
    }
  }, [startAddressSelected, companyAddressSelected, onAddressChange]);
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
          addressSelected={startAddressSelected}
          addressSetter={setStartAddressSelected}
          addressSuggestions={startAddressSuggestions}
          error={errors.startAddress}
          addressUpdater={updateStartingAddress}
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
        <EntryLabel
          required={true}
          error={errors.companyAddress}
          label="Workplace Address"
        />
        <ControlledAddressCombobox
          isDisabled={false}
          control={control}
          name="companyAddress"
          addressSelected={companyAddressSelected}
          addressSetter={setCompanyAddressSelected}
          addressSuggestions={companyAddressSuggestions}
          error={errors.companyAddress}
          addressUpdater={updateCompanyAddress}
        />
        {errors.companyAddress && (
          <ErrorDisplay>{errors.companyAddress.message}</ErrorDisplay>
        )}
      </div>
    </div>
  );
};

export default StepTwo;
