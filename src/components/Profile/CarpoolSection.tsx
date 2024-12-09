import { ErrorDisplay, Note, ProfileHeader } from "../../styles/profile";
import { Role, User } from "@prisma/client";
import { EntryLabel } from "../EntryLabel";
import { TextField } from "../TextField";
import {
  Control,
  Controller,
  FieldErrors,
  useForm,
  UseFormHandleSubmit,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import { OnboardingFormInputs } from "../../utils/types";
import ControlledAddressCombobox from "./ControlledAddressCombobox";
import Checkbox from "@mui/material/Checkbox";
import DayBox from "./DayBox";
import ControlledTimePicker from "./ControlledTimePicker";
import { useAddressSelection } from "../../utils/useAddressSelection";
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
  const daysOfWeek = ["Su", "M", "Tu", "W", "Th", "F", "S"];

  return (
    <div className="relative my-20 flex h-full   flex-col  justify-start">
      <ProfileHeader className={"w-[700px] !text-4xl"}>
        Carpool Details
      </ProfileHeader>

      <EntryLabel label="Commuting Schedule" className={"!text-2xl"} />

      {/* Days working field  */}
      <div className="mb-2 aspect-[7/1] w-full max-w-[360px] md:my-4 lg:pl-20">
        <div className="flex h-full w-full items-center justify-evenly ">
          {daysOfWeek.map((day, index) => (
            <Controller
              key={day + index.toString()}
              name={`daysWorking.${index}`}
              control={control}
              render={({
                field: { onChange, value },
                formState: { defaultValues },
              }) => (
                <Checkbox
                  key={day + index.toString()}
                  sx={{
                    input: { width: 1, height: 1 },
                    aspectRatio: 1,
                    width: 1,
                    height: 1,
                    padding: 0,
                  }}
                  disabled={isViewer}
                  checked={value}
                  onChange={onChange}
                  checkedIcon={<DayBox day={day} isSelected={true} />}
                  icon={<DayBox day={day} isSelected={false} />}
                />
              )}
            />
          ))}
        </div>

        {errors.daysWorking && (
          <ErrorDisplay>{errors.daysWorking.message}</ErrorDisplay>
        )}
      </div>
      {/* Start/End Time Fields  */}
      <div className="mt-4 flex w-full justify-between gap-6 pb-4 md:w-96">
        <div className="flex flex-1 flex-col gap-2">
          <EntryLabel
            required={!isViewer}
            error={errors.startTime}
            label="Start Time"
          />
          <ControlledTimePicker
            isDisabled={isViewer}
            control={control}
            name={"startTime"}
            value={user?.startTime ? user.startTime : undefined}
          />
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <EntryLabel
            required={!isViewer}
            error={errors.endTime}
            label="End Time"
          />
          <ControlledTimePicker
            isDisabled={isViewer}
            control={control}
            name={"endTime"}
            value={user?.endTime ? user.endTime : undefined}
          />
        </div>
      </div>
      <Note className="py-4 md:w-96">
        Please input the start and end times of your work, rather than your
        departure times. If your work hours are flexible, coordinate directly
        with potential riders or drivers to inform them.
      </Note>
      <EntryLabel label="Locations" className={"!text-2xl"} />
      {/* Starting Location field  */}
      <EntryLabel
        required={!isViewer}
        error={errors.startAddress}
        className={"my-2 !text-lg"}
        label="Home Address"
      />
      <div>
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
      {/* Company Address field  */}
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
      <div className="mt-8 font-montserrat">
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
