import * as React from "react";
import { FieldError } from "react-hook-form";
import { ErrorDisplay } from "../styles/profile";
import { classNames } from "../utils/classNames";

type TextFieldOwnProps = {
  label?: string;
  error?: FieldError;
  charLimit?: number;
  inputClassName?: string;
};

type TextFieldProps = TextFieldOwnProps &
  React.ComponentPropsWithoutRef<"input">;

export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      charLimit = 524288,
      label,
      id,
      name,
      error,
      type,
      className,
      inputClassName,
      ...rest
    },
    forwardedRef
  ) => (
    <div className={classNames(`flex w-full flex-col space-y-2`, className)}>
      <input
        {...rest}
        ref={forwardedRef}
        id={id || name}
        name={name}
        type={type}
        maxLength={charLimit}
        className={classNames(
          `form-input w-full rounded-md px-3 py-2 shadow-sm ${
            error ? "border-northeastern-red" : "border-black"
          }`,
          inputClassName
        )}
      />
      {error && <ErrorDisplay>{error.message}</ErrorDisplay>}
    </div>
  )
);

TextField.displayName = "TextField";
