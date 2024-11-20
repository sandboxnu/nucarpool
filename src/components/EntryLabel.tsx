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
  font-family: "Montserrat", sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 20px;
  line-height: 24px;
  display: flex;
  align-items: center;
  color: ${(props) => (props.error ? "#B12424" : "#000000")};

  @media (min-width: 834px) {
    padding-top: 0.3rem;
    padding-bottom: 0.4rem;
    font-size: 20px;
  }
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
