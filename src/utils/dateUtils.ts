import React from "react";
import { UseFormSetValue } from "react-hook-form";
import { OnboardingFormInputs } from "./types";

const handleMonthChange =
  (
    field: "coopStartDate" | "coopEndDate",
    setValue: UseFormSetValue<OnboardingFormInputs>,
  ) =>
  (event: React.ChangeEvent<HTMLInputElement>): void => {
    const [year, month] = event.target.value.split("-").map(Number);
    const lastDay = new Date(year, month, 0);
    setValue(field, lastDay, { shouldValidate: true });
  };

const formatDateToMonth = (date: Date | null): string | undefined => {
  if (!date) {
    return undefined;
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

export { handleMonthChange, formatDateToMonth };
