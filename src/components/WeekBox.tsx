import React from "react";
import styled from "styled-components";
import { OnboardingFormInputs } from "../pages/profile";
import { Control, Controller } from "react-hook-form";
import { Checkbox } from "@mui/material";

const BaseBox = styled.div`
  border: 1px solid black;
  border-left: 0rem solid;
  color: black;
  width: 100%;
  height: 100%;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
`;
const StyledCheckedBox = styled(BaseBox)`
  background-color: #c7efb3;
`;

interface WeekBoxProps {
  control: Control<OnboardingFormInputs>;
  daysOfWeek: string[];
}
const StyledUncheckedBox = styled(BaseBox)``;

const DayBox = ({
  day,
  isSelected,
}: {
  day: string;
  isSelected: boolean;
}): React.ReactElement => {
  if (isSelected) {
    return <StyledCheckedBox>{day}</StyledCheckedBox>;
  } else {
    return <StyledUncheckedBox>{day}</StyledUncheckedBox>;
  }
};

const InteractiveDaysWorkingGrid = (props: WeekBoxProps) => {
  return (
    <React.Fragment>
      {props.daysOfWeek.map((day, index) => (
        <Controller
          key={day + index.toString()}
          name={`daysWorking.${index}`}
          control={props.control}
          render={({
            field: { onChange, value },
            formState: { defaultValues },
          }) => (
            <Checkbox
              key={day + index.toString()}
              sx={{
                input: { width: 1, height: 1 },
                aspectRatio: 1 / 1,
                width: 1,
                height: 1,
                padding: 0,
              }}
              checked={value}
              onChange={onChange}
              checkedIcon={<DayBox day={day} isSelected={true} />}
              icon={<DayBox day={day} isSelected={false} />}
            />
          )}
        />
      ))}
    </React.Fragment>
  );
};

export default InteractiveDaysWorkingGrid;
