import React from "react";
import styled from "styled-components";

const StyledCheckedBox = styled.div`
  background-color: #d0142c;
  border: 3px solid black;
  color: white;
  width: 2rem;
  height: 2rem;
  text-align: center;
`;

const StyledUncheckedBox = styled.div`
  border: 3px solid black;
  color: black;
  width: 2rem;
  height: 2rem;
  text-align: center;
`;

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

export default DayBox;
