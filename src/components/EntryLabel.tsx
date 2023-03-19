import { FieldError } from "react-hook-form";
import styled from "styled-components";

interface EntryLabelProps {
  error?: FieldError;
  label: string;
  required?: boolean;
}

const StyledLabel = styled.label<{
  error?: boolean;
}>`
  font-family: "Montserrat";
  font-style: normal;
  font-weight: 700;
  font-size: 20px;
  line-height: 24.38px;
  display: flex;
  align-items: center;
  color: ${(props) => (props.error ? "#B12424" : "#000000")};
`;

export const EntryLabel = (props: EntryLabelProps) => {
  return props.required ? (
    <StyledLabel error={!!props.error}>
      {props.label}
      <span className="pl-1 text-northeastern-red">*</span>
    </StyledLabel>
  ) : (
    <StyledLabel>{props.label}</StyledLabel>
  );
};
