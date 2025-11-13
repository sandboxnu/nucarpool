import { Control, FieldError } from "react-hook-form";
import { OnboardingFormInputs } from "../../../utils/types";
import { EntryLabel } from "../../EntryLabel";
import ControlledTimePicker from "../../Profile/ControlledTimePicker";
import { Note } from "../../../styles/profile";

interface TimeRangePickerProps {
  control: Control<OnboardingFormInputs>;
  errors?: {
    startTime?: FieldError;
    endTime?: FieldError;
  };
  isDisabled?: boolean;
  noteText?: string;
  noteClassName?: string;
  containerClassName?: string;
  showLabels?: boolean;
  timePickerValues?: {
    startTime?: Date | null;
    endTime?: Date | null;
  };
}

const SelectTimeRange = ({
  control,
  errors,
  isDisabled = false,
  noteText = "Please input the start and end times of your work, rather than your departure times. If your work hours are flexible, coordinate directly with potential riders or drivers to inform them.",
  noteClassName = "",
  containerClassName = "",
  showLabels = true,
  timePickerValues = {},
}: TimeRangePickerProps) => {
  return (
    <>
      <div className={containerClassName}>
        {/* Start Time */}
        <div className="flex flex-1 flex-col gap-2">
          {showLabels && (
            <EntryLabel
              required={!isDisabled}
              error={errors?.startTime}
              label="Start Time"
            />
          )}
          <ControlledTimePicker
            isDisabled={isDisabled}
            control={control}
            name="startTime"
            error={errors?.startTime}
            value={timePickerValues.startTime || undefined}
          />
        </div>

        {/* End Time */}
        <div className="flex flex-1 flex-col gap-2">
          {showLabels && (
            <EntryLabel
              required={!isDisabled}
              error={errors?.endTime}
              label="End Time"
            />
          )}
          <ControlledTimePicker
            isDisabled={isDisabled}
            control={control}
            name="endTime"
            error={errors?.endTime}
            value={timePickerValues.endTime || undefined}
          />
        </div>
      </div>

      {/* Note */}
      {noteText && (
        <div className="w-full">
          <Note className={noteClassName}>{noteText}</Note>
        </div>
      )}
    </>
  );
};

export default SelectTimeRange;
