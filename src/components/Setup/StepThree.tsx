import { OnboardingFormInputs } from "../../utils/types";
import {
  UseFormWatch,
  FieldErrors,
  UseFormRegister,
  Control,
  Controller,
  UseFormSetValue,
} from "react-hook-form";

import { User } from "@prisma/client";
import Checkbox from "@mui/material/Checkbox";
import DayBox from "../Profile/DayBox";
import { ErrorDisplay, Note } from "../../styles/profile";
import { EntryLabel } from "../EntryLabel";
import ControlledTimePicker from "../Profile/ControlledTimePicker";
import { TextField } from "../TextField";
import { formatDateToMonth, handleMonthChange } from "../../utils/dateUtils";

interface StepThreeProps {
  errors: FieldErrors<OnboardingFormInputs>;
  watch: UseFormWatch<OnboardingFormInputs>;
  control: Control<OnboardingFormInputs>;
  setValue: UseFormSetValue<OnboardingFormInputs>;
  user?: User;
}
const StepThree = ({
  errors,
  watch,
  user,
  control,
  setValue,
}: StepThreeProps) => {
  const daysOfWeek = ["Su", "M", "Tu", "W", "Th", "F", "S"];

  return (
    <div className="flex flex-col items-center justify-center bg-white px-4">
      <div className="mb-8 text-center font-montserrat text-3xl font-bold">
        <span>When are you&nbsp;</span>
        <span className="text-northeastern-red">carpooling?</span>
      </div>

      <div className="flex w-1/2 flex-col items-start space-y-8 ">
        <div className="flex flex-col space-y-2">
          <EntryLabel required={false} label="Days of the Week" />
          <div className="flex flex-row items-center ">
            {daysOfWeek.map((day, index) => (
              <Controller
                key={day + index.toString()}
                name={`daysWorking.${index}`}
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Checkbox
                    key={day + index.toString()}
                    sx={{ padding: 0 }}
                    disabled={false}
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

        {/* Time Section */}
        <div className="flex flex-col space-y-2">
          <div className="flex flex-col gap-x-16 gap-y-4 md:flex-row">
            <div className="flex flex-col ">
              <EntryLabel
                required={true}
                error={errors.startTime}
                label="Start Time"
              />
              <ControlledTimePicker
                isDisabled={false}
                control={control}
                name="startTime"
                value={user?.startTime || undefined}
              />
            </div>
            <div className="flex flex-col ">
              <EntryLabel
                required={true}
                error={errors.endTime}
                label="End Time"
              />
              <ControlledTimePicker
                isDisabled={false}
                control={control}
                name="endTime"
                value={user?.endTime || undefined}
              />
            </div>
          </div>
          <Note className="py-2">
            Please input the start and end times of your work, rather than your
            departure times. If your work hours are flexible, coordinate
            directly with potential riders or drivers.
          </Note>
        </div>

        {/* Date Section */}
        <div className="flex flex-col space-y-2">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex flex-col">
              <EntryLabel
                required={true}
                error={errors.coopStartDate}
                label="Start Date"
              />
              <TextField
                type="month"
                isDisabled={false}
                id="coopStartDate"
                error={errors.coopStartDate}
                onChange={handleMonthChange("coopStartDate", setValue)}
                defaultValue={
                  formatDateToMonth(watch("coopStartDate")) || undefined
                }
              />
            </div>
            <div className="flex flex-col">
              <EntryLabel
                required={true}
                error={errors.coopEndDate}
                label="End Date"
              />
              <TextField
                type="month"
                isDisabled={false}
                id="coopEndDate"
                error={errors.coopEndDate}
                onChange={handleMonthChange("coopEndDate", setValue)}
                defaultValue={
                  formatDateToMonth(watch("coopEndDate")) || undefined
                }
              />
            </div>
          </div>
          <Note className="py-2">
            Please indicate the start and the end dates of your co-op. If you
            don&apos;t know exact dates, you can use approximate dates.
          </Note>
        </div>
      </div>
    </div>
  );
};

export default StepThree;
