import { TimePicker, ConfigProvider } from "antd";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);
import { forwardRef, ReactNode, useEffect, useState } from "react";
import { Control, Controller, FieldError } from "react-hook-form";
import { OnboardingFormInputs } from "../../utils/types";
import { ErrorDisplay } from "../../styles/profile";
import * as React from "react";
interface ControlledTimePickerProps {
  control: Control<OnboardingFormInputs>;
  name: "startTime" | "endTime";
  placeholder?: string;
  value?: Date;
  isDisabled?: boolean;
  error?: FieldError;
}
const ControlledTimePicker = (props: ControlledTimePickerProps) => {
  useEffect(() => {
    if (props.value) {
      dayjs.utc(props.value);
    }
  }, [props.value]);

  const customSuffixIcon = (): ReactNode => {
    return (
      <div className="h-1/12 flex w-1/12 justify-center text-center text-xs text-northeastern-red">
        ▼
      </div>
    );
  };
  const TimePickerWrapper = forwardRef<
    HTMLDivElement,
    React.ComponentProps<typeof TimePicker>
  >((props, ref) => (
    <div ref={ref}>
      <TimePicker {...props} />
    </div>
  ));
  TimePickerWrapper.displayName = "TimePickerWrapper";

  return (
    <Controller
      name={props.name}
      control={props.control}
      render={({ field: { ref, ...fieldProps }, fieldState }) => {
        return (
          <ConfigProvider
            theme={{
              components: {
                DatePicker: {
                  fontWeightStrong: 500,
                  controlItemBgActive: "#FFA9A9",
                  cellHoverBg: "#FFE6E6",
                },
              },
              token: {
                fontFamily: "Montserrat",
                fontSize: 16,
                colorPrimary: "#C8102E",
              },
            }}
          >
            <div className={"flex flex-col "}>
              <TimePickerWrapper
                ref={ref}
                needConfirm={false}
                className="form-input w-full  rounded-lg border border-black "
                format="h:mm A"
                suffixIcon={customSuffixIcon()}
                status={fieldState.error ? "error" : undefined}
                placeholder={props.placeholder}
                showNow={false}
                disabled={props.isDisabled}
                minuteStep={15}
                use12Hours={true}
                value={fieldProps.value ? dayjs(fieldProps.value) : null}
                inputReadOnly={true}
                onChange={(date) => {
                  fieldProps.onChange(date ? date.toDate() : null);
                }}
              />
              {props.error && (
                <ErrorDisplay>{props.error.message}</ErrorDisplay>
              )}
            </div>
          </ConfigProvider>
        );
      }}
    />
  );
};
export default ControlledTimePicker;
