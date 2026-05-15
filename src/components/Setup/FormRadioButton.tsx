import { ComponentPropsWithoutRef } from "react";
import React, { useState, useEffect } from "react";
import { FieldError } from "react-hook-form";

type RadioProps<T extends string | number> = {
  label: string;
  value: T;
  id: string;
  currentlySelected: T;
  error?: FieldError;
  className?: string;
} & React.ComponentPropsWithoutRef<"input">;

const RadioButton = React.forwardRef<
  HTMLInputElement,
  RadioProps<string | number>
>(
  (
    { label, id, value, currentlySelected, error, className, ...rest },
    forwardedRef,
  ) => {
    return (
      <label
        htmlFor={id}
        className={`flex cursor-pointer items-center justify-center rounded-lg border border-black px-6 py-2 font-montserrat text-2xl transition ${
          currentlySelected === value
            ? "bg-northeastern-red text-white"
            : "bg-white text-black "
        } ${className}`}
      >
        <input
          type="radio"
          id={id}
          name="role"
          value={value}
          checked={currentlySelected === value}
          className="hidden"
          ref={forwardedRef}
          {...rest}
        />
        {label}
        {error && <p className="mt-2 text-sm text-red-500">{error.message}</p>}
      </label>
    );
  },
);

RadioButton.displayName = "RadioButton";
export default RadioButton;
