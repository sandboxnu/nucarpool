import { ErrorDisplay, Note, ProfileHeader } from "../../styles/profile";
import { Role } from "@prisma/client";
import { EntryLabel } from "../EntryLabel";
import { TextField } from "../TextField";
import {
  Control,
  FieldError,
  FieldErrors,
  UseFormHandleSubmit,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import { OnboardingFormInputs, User } from "../../utils/types";
import ControlledAddressCombobox from "./ControlledAddressCombobox";
import { useAddressSelection } from "../../utils/useAddressSelection";
import SelectDays from "../Shared/Schedule/SelectDays";
import SelectTimeRange from "../Shared/Schedule/SelectTimeRange";
interface CarpoolSectionProps {
  register: UseFormRegister<OnboardingFormInputs>;
  errors: FieldErrors<OnboardingFormInputs>;
  setValue: UseFormSetValue<OnboardingFormInputs>;
  watch: UseFormWatch<OnboardingFormInputs>;
  onFileSelect: (file: File | null) => void;
  control: Control<OnboardingFormInputs>;
  onSubmit: ReturnType<UseFormHandleSubmit<OnboardingFormInputs>>;
  startAddressHook: ReturnType<typeof useAddressSelection>;
  companyAddressHook: ReturnType<typeof useAddressSelection>;
  user?: User;
}
const CarpoolSection = ({
  errors,
  watch,
  register,
  onSubmit,
  control,
  startAddressHook,
  companyAddressHook,
  user,
}: CarpoolSectionProps) => {
  const isViewer = watch("role") === Role.VIEWER;

  return (
    <div className="flex flex-col space-y-4">
      <ProfileHeader className={"!text-4xl"}>
        Carpool Details
      </ProfileHeader>

      <EntryLabel
        label="Commuting Schedule"
        required={true}
        error={errors.daysWorking as FieldError | (FieldError | undefined)[]}
        className={"!text-2xl"}
      />

      <div className="mb-2 w-full max-w-[360px] md:my-4 lg:pl-20">
        <SelectDays
          control={control}
          disabled={isViewer}
          error={errors.daysWorking}
        />
      </div>
      {errors.daysWorking && (
        <ErrorDisplay>{errors.daysWorking.message}</ErrorDisplay>
      )}
      <SelectTimeRange
        control={control}
        errors={{
          startTime: errors.startTime,
          endTime: errors.endTime,
        }}
        isDisabled={isViewer}
        noteText="Please input the start and end times of your work, rather than your departure times. If your work hours are flexible, coordinate directly with potential riders or drivers to inform them."
        noteClassName="py-4 md:w-96"
        containerClassName="relative mt-4 flex w-full justify-between gap-6 pb-4 md:w-96"
        timePickerValues={{
          startTime: user?.startTime ? user.startTime : undefined,
          endTime: user?.endTime ? user.endTime : undefined,
        }}
      />
      <EntryLabel label="Locations" className={"!text-2xl"} />
      <EntryLabel
        required={!isViewer}
        error={errors.startAddress}
        className={"my-2 !text-lg"}
        label="Home Address"
      />
      <div className="z-10">
        <ControlledAddressCombobox
          isDisabled={isViewer}
          control={control}
          name={"startAddress"}
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
      </div>
      {errors.startAddress && (
        <ErrorDisplay>{errors.startAddress.message}</ErrorDisplay>
      )}
      <EntryLabel
        required={!isViewer}
        error={errors.companyName}
        className={"my-2 !text-lg"}
        label="Workplace Name"
      />
      <TextField
        className={`w-full`}
        inputClassName={`h-12`}
        label="Workplace Name"
        isDisabled={isViewer}
        id="companyName"
        error={errors.companyName}
        type="text"
        {...register("companyName")}
      />
      <EntryLabel
        required={!isViewer}
        error={errors.companyAddress}
        className={"mt-2 !text-lg"}
        label="Workplace Address"
      />
      <Note className={"mb-2"}>
        Note: Select the autocomplete results, even if you typed the address out
      </Note>
        <ControlledAddressCombobox
          isDisabled={isViewer}
          control={control}
          name={"companyAddress"}
          addressSelected={companyAddressHook.selectedAddress}
          addressSetter={companyAddressHook.setSelectedAddress}
          addressSuggestions={companyAddressHook.suggestions}
          error={errors.companyAddress}
          addressUpdater={companyAddressHook.updateAddress}
        />
      {errors.companyAddress && (
        <ErrorDisplay>{errors.companyAddress.message}</ErrorDisplay>
      )}
      <div className="py-8 font-montserrat">
        <button
          type="button"
          className="w-full rounded-lg bg-northeastern-red py-3 text-lg text-white hover:bg-red-700 "
          onClick={onSubmit}
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};
export default CarpoolSection;
