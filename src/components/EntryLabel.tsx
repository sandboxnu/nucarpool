import { FieldError } from "react-hook-form";
import styled from "styled-components";

interface EntryLabelProps {
  error?: FieldError | (FieldError | undefined)[];
  label: string;
  required?: boolean;
  className?: string;
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
    <StyledLabel error={!!props.error} className={props.className}>
      {props.label}
      <span className={"pl-1 text-northeastern-red "}>*</span>
    </StyledLabel>
  ) : (
    <StyledLabel className={props.className}>{props.label} </StyledLabel>
  );
};
