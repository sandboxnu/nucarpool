import { TimePicker } from "antd";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);
import { ReactNode, useEffect, useState } from "react";
import { Control, Controller } from "react-hook-form";
import { OnboardingFormInputs } from "../pages/profile";
interface ControlledTimePickerRHFProps {
  control: Control<OnboardingFormInputs>;
  name: "startTime" | "endTime";
  placeholder?: string;
  value?: Date;
}
const ControlledTimePickerRHF = (props: ControlledTimePickerRHFProps) => {
  const [displayedTime, setDisplayedTime] = useState<Dayjs | undefined>(
    props.value ? dayjs.utc(props.value) : undefined
  );

  useEffect(() => {
    if (props.value) {
      dayjs.utc(props.value);
    }
  }, [props.value]);

  const convertInputDateToUTC = (inputDate: Date): Date => {
    const inputHours = inputDate.getHours();
    const result = dayjs.utc(
      `2022-2-2 ${inputHours}:${inputDate.getMinutes()}`
    );
    return result.toDate();
  };

  const customSuffixIcon = (): ReactNode => {
    return (
      <div className="h-1/12 text-northeastern-red flex w-1/12 justify-center text-center text-xs">
        ▼
      </div>
    );
  };
  return (
    <Controller
      name={props.name}
      control={props.control}
      render={({ field: { ref, ...fieldProps }, fieldState }) => (
        <div className={"flex flex-col"}>
          <TimePicker
            className="form-input w-full rounded-lg"
            format="h:mm A"
            suffixIcon={customSuffixIcon()}
            ref={ref}
            status={fieldState.error ? "error" : undefined}
            placeholder={props.placeholder}
            showNow={false}
            minuteStep={15}
            use12Hours={true}
            value={displayedTime}
            onSelect={(date) => {
              if (!date.isUTC()) {
                const utcDate = convertInputDateToUTC(date.toDate());
                setDisplayedTime(date);
                fieldProps.onChange(utcDate);
              } else {
                setDisplayedTime(dayjs.utc(date));
                fieldProps.onChange(date.toDate());
              }
            }}
          />
        </div>
      )}
    />
  );
};
export default ControlledTimePickerRHF;
