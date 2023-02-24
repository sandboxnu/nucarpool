import * as React from "react";
import { FieldError } from "react-hook-form";
import { classNames } from "../utils/classNames";

type TextFieldOwnProps = {
  label?: string;
  error?: FieldError;
  charLimit?: number;
};

type TextFieldProps = TextFieldOwnProps &
  React.ComponentPropsWithoutRef<"input">;

export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  (
    { charLimit = 524288, label, id, name, error, type, className, ...rest },
    forwardedRef
  ) => (
    <div className={classNames(`flex flex-col space-y-2 w-full}`, className)}>
      {label && (
        <label htmlFor={id || name} className="font-medium text-sm">
          {label}
        </label>
      )}
      <input
        {...rest}
        ref={forwardedRef}
        id={id || name}
        name={name}
        type={type}
        maxLength={charLimit}
        className={`form-input w-full shadow-sm rounded-md px-3 py-2 ${
          error ? "border-red-500" : "border-gray-300"
        }`}
      />
      {error && <p className="text-red-500 text-sm mt-2">{error.message}</p>}
    </div>
  )
);

TextField.displayName = "TextField";
