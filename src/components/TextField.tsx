import * as React from "react";
import { FieldError } from "react-hook-form";
import { EntryLabel, ErrorDisplay } from "../styles/profile";
import { classNames } from "../utils/classNames";

type TextFieldOwnProps = {
  label?: string;
  error?: FieldError;
  charLimit?: number;
  // classnames passed to the Input HTML element for styling purposes
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
    <div className={classNames(`flex flex-col space-y-2 w-full`, className)}>
      {label && <EntryLabel error={!!error?.message}>{label}</EntryLabel>}
      <input
        {...rest}
        ref={forwardedRef}
        id={id || name}
        name={name}
        type={type}
        maxLength={charLimit}
        className={classNames(
          `form-input border-black w-full shadow-sm rounded-md px-3 py-2 ${
            error ? "border-northeastern-red" : "border-gray-300"
          }`,
          inputClassName
        )}
      />
      {error && <ErrorDisplay>{error.message}</ErrorDisplay>}
    </div>
  )
);

TextField.displayName = "TextField";
