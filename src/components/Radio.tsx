import { Role } from "@prisma/client";
import React, { useEffect, useState } from "react";
import { FieldError } from "react-hook-form";
import styled from "styled-components";

type RadioOwnProps = {
  label?: string;
  error?: FieldError;
  role?: Role;
  value: Role;
  currentlySelected: Role;
};

type RadioProps = RadioOwnProps & React.ComponentPropsWithoutRef<"input">;

const StyledActiveRadioButton = styled.label`
  background-color: #d0142c;
  color: white;

  font-family: "Montserrat";
  font-style: normal;
  font-weight: 500;
  font-size: 24px;
  border-radius: 10px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledInactiveRadioButton = styled.label`
  background-color: white;
  color: black;
  border: 1px solid black;

  font-family: "Montserrat";
  font-style: normal;
  font-weight: 500;
  font-size: 24px;
  border-radius: 10px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      label,
      id,
      name,
      value,
      error,
      currentlySelected,
      className,
      role,
      ...rest
    },
    forwardedRef
  ): React.ReactElement => {
    const [isActive, setIsActive] = useState<boolean>(false);

    useEffect(() => {
      setIsActive(currentlySelected === value);
    });

    const input = (
      <input
        {...rest}
        ref={forwardedRef}
        id={id}
        name={name}
        type="radio"
        value={value}
        className={"fixed opacity-0"}
      />
    );
    if (isActive) {
      return (
        <StyledActiveRadioButton
          className={"form-input w-3/12 h-14"}
          htmlFor={id}
        >
          {input}
          {label}
          {error && (
            <p className="text-red-500 text-sm mt-2">{error.message}</p>
          )}
        </StyledActiveRadioButton>
      );
    } else {
      return (
        <StyledInactiveRadioButton
          className={"form-input w-3/12 h-14"}
          htmlFor={id}
        >
          {input}
          {label}
          {error && (
            <p className="text-red-500 text-sm mt-2">{error.message}</p>
          )}
        </StyledInactiveRadioButton>
      );
    }
  }
);

Radio.displayName = "Radio";

export default Radio;
