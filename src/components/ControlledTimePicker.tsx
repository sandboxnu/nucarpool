import { TimePicker } from "antd";
import dayjs from "dayjs";
import { useState } from "react";
import { Control, Controller } from "react-hook-form";
import { OnboardingFormInputs } from "../pages/profile";

interface ControlledTimePickerProps {
  control: Control<OnboardingFormInputs>;
  name: "startTime" | "endTime";
  placeholder?: string;
}

const ControlledTimePicker = (props: ControlledTimePickerProps) => {
  const [displayedTime, setDisplayedTime] = useState<dayjs.Dayjs | null>(null);

  const convertInputDateToUTC = (inputDate: Date): Date => {
    const inputHours = inputDate.getHours();
    /**
     * this will be the hours difference between GMT-0 and the inputDate's timezone
     * eg: utcOffset for inputDate's that are EST will either -5 or -4 depending on Daylight savings
     *  */
    const utcOffset: number = parseInt(dayjs(inputDate).format("Z"));

    let utcHours: number;

    if (inputHours + utcOffset < 0) {
      utcHours = inputHours + utcOffset + 24;
    } else {
      utcHours = inputHours + utcOffset;
    }
    const result = dayjs(`2022-2-2 ${utcHours}:${inputDate.getMinutes()}`);

    return result.toDate();
  };
  return (
    <Controller
      name={props.name}
      control={props.control}
      rules={{
        required: "Please enter a start time",
      }}
      render={({ field: { ref, ...fieldProps }, fieldState }) => (
        <>
          <TimePicker
            format="h:mm A"
            ref={ref}
            status={fieldState.error ? "error" : undefined}
            placeholder={props.placeholder}
            showNow={false}
            minuteStep={15}
            use12Hours={true}
            value={displayedTime}
            onBlur={fieldProps.onBlur}
            onSelect={(date) => {
              setDisplayedTime(dayjs(date.valueOf()));
              const convertedDate = convertInputDateToUTC(date.toDate());

              fieldProps.onChange(convertedDate);
            }}
          />
          {fieldState.error ? (
            <span className="">{fieldState.error.message}</span>
          ) : null}
        </>
      )}
    />
  );
};

export default ControlledTimePicker;
