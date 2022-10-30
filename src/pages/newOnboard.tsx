import React, { useState } from "react";
import { Checkbox } from "@mui/material";
import DayBox from "../components/DayBox";

const daysOfWeek = ["S", "M", "T", "W", "T", "F", "S"];

const NewOnboard = () => {
  const [daysChecked, setDaysChecked] = useState([
    false,
    false,
    false,
    false,
    false,
    false,
    false,
  ]);

  return (
    <div>
      {daysOfWeek.map((day, index) => (
        <Checkbox
          key={day + index.toString()}
          sx={{
            input: { width: 1, height: 1 },
            padding: 0,
          }}
          value={daysChecked[index]}
          onChange={(e) =>
            setDaysChecked([
              ...daysChecked.slice(0, index - 1),
              e.target.checked,
              ...daysChecked.slice(index + 1),
            ])
          }
          checkedIcon={<DayBox day={day} isSelected={true} />}
          icon={<DayBox day={day} isSelected={false} />}
          defaultChecked={false}
        />
      ))}
    </div>
  );
};

export default NewOnboard;
