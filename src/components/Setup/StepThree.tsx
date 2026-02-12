import { OnboardingFormInputs, User } from "../../utils/types";
import {
  UseFormWatch,
  FieldErrors,
  Control,
  Controller,
  UseFormSetValue,
} from "react-hook-form";
import { ErrorDisplay, Note } from "../../styles/profile";
import { EntryLabel } from "../EntryLabel";
import { DatePicker } from "antd";
import dayjs, { Dayjs } from "dayjs";
import useIsMobile from "../../utils/useIsMobile";
import SelectDays from "../Shared/Schedule/SelectDays";
import SelectTimeRange from "../Shared/Schedule/SelectTimeRange";

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
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col items-center justify-center bg-white px-2">
      <div
        className={`mb-4 text-center font-montserrat ${isMobile ? "text-2xl" : "text-3xl"} font-bold`}
      >
        <span>When are you&nbsp;</span>
        <span className="text-northeastern-red">carpooling?</span>
      </div>

      <div className="flex flex-col items-start space-y-2 w-full">
        {/* Days of the Week */}
        <div className="flex flex-col space-y-1 w-full">
          <EntryLabel
            required={true}
            error={
              errors.daysWorking
                ? {
                    type: "custom",
                    message: "Please select at least one day.",
                  }
                : undefined
            }
            label="Days of the Week"
          />
          <div className="flex flex-row items-center justify-center w-full">
            <SelectDays
              control={control}
              disabled={false}
              useStaticDayBox={true}
              dayBoxClassName={isMobile ? "!h-8 !w-8" : "!h-10 !w-10"}
              error={errors.daysWorking}
            />
          </div>
          {errors.daysWorking && (
            <ErrorDisplay className="text-xs">
              {errors.daysWorking.message}
            </ErrorDisplay>
          )}
        </div>

        {/* Time Section */}
        <SelectTimeRange
          control={control}
          errors={{
            startTime: errors.startTime,
            endTime: errors.endTime,
          }}
          isDisabled={false}
          noteText="Please input the start and end times of your work, rather than your departure times."
          noteClassName={`py-1 ${isMobile ? "text-xs" : "text-sm"}`}
          containerClassName={`flex w-full flex-col ${isMobile ? "mt-2" : "mt-3"}`}
          timePickerValues={{
            startTime: watch("startTime") || user?.startTime || undefined,
            endTime: watch("endTime") || user?.endTime || undefined,
          }}
        />

        {/* Date Section */}
        <div className={`flex w-full gap-4 ${isMobile ? "mt-1" : "mt-2"}`}>
          {/* Start Date */}
          <div className="flex flex-col w-1/2">
            <EntryLabel
              required={true}
              error={errors.coopStartDate}
              label="Start Date"
              className="w-full"
            />
            <DatePicker<Dayjs>
              id="coopStartDate"
              picker="month"
              onChange={(date: Dayjs, dateString) =>
                setValue("coopStartDate", date ? date.toDate() : null)
              }
              format="YYYY-MM"
              inputReadOnly={true}
              className={`${isMobile ? "h-10 text-base" : "h-12 text-lg"} w-full border rounded-md p-2`}
            />
          </div>

          {/* End Date */}
          <div className="flex flex-grow-0 flex-col w-1/2">
            <EntryLabel
              required={true}
              error={errors.coopEndDate}
              label="End Date"
            />
            <DatePicker<Dayjs>
              id="coopEndDate"
              picker="month"
              onChange={(date: Dayjs, dateString) =>
                setValue("coopEndDate", date ? date.toDate() : null)
              }
              format="YYYY-MM"
              inputReadOnly={true}
              className={`${isMobile ? "h-10 text-base" : "h-12 text-lg"} w-full border rounded-md p-2`}
            />
          </div>
        </div>

        {/* Note for Date Section */}
        <div className="w-full">
          <Note className={`py-1 ${isMobile ? "text-xs" : "text-sm"}`}>
            Please indicate the start and end dates of your co-op. Approximate
            dates are acceptable.
          </Note>
        </div>
      </div>

      {isMobile && (
        <div className="mt-2 w-full rounded-md bg-amber-50 p-1 text-center">
          <p className="text-xs font-medium text-amber-800">
            ⚠️ Mobile version is currently under development.
          </p>
        </div>
      )}
    </div>
  );
};

export default StepThree;
