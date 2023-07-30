import React from "react";
import styled from "styled-components";

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

export default DayBox;
