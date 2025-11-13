import useIsMobile from "../../utils/useIsMobile";
import { Note, ProfileHeader } from "../../styles/profile";
import { Role, Status } from "@prisma/client";
import { EntryLabel } from "../EntryLabel";
import { TextField } from "../TextField";
import {
  Control,
  Controller,
  FieldErrors,
  UseFormHandleSubmit,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import { OnboardingFormInputs } from "../../utils/types";
import { formatDateToMonth, handleMonthChange } from "../../utils/dateUtils";
import FormControlLabel from "@mui/material/FormControlLabel";
import { Switch } from "@mui/material";
import { DatePicker } from "antd";
import dayjs, { Dayjs } from "dayjs";

interface AccountSectionProps {
  errors: FieldErrors<OnboardingFormInputs>;
  setValue: UseFormSetValue<OnboardingFormInputs>;
  watch: UseFormWatch<OnboardingFormInputs>;
  onSubmit: ReturnType<UseFormHandleSubmit<OnboardingFormInputs>>;
  control: Control<OnboardingFormInputs>;
}

const AccountSection = ({
  errors,
  watch,
  onSubmit,
  control,
  setValue,
}: AccountSectionProps) => {
  const isMobile = useIsMobile();
  const isViewer = watch("role") === Role.VIEWER;

  return (
    <div
      className={`flex h-fit ${isMobile ? "w-full" : "w-[700px]"} flex-col justify-start`}
    >
      <ProfileHeader className={isMobile ? "!text-2xl" : "!text-4xl"}>
        Account Status
      </ProfileHeader>

      <span>
        Profile is currently{" "}
        <span className="font-bold">
          {watch("status") === Status.ACTIVE ? "ACTIVE" : "INACTIVE"}{" "}
        </span>
      </span>

      <div className="mt-2 w-full">
        {!isViewer && (
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <div className="flex flex-col items-start font-montserrat">
                <FormControlLabel
                  className="mb-6 mt-4 pl-3"
                  control={
                    <Switch
                      checked={field.value === Status.ACTIVE}
                      onChange={(e) =>
                        field.onChange(
                          e.target.checked ? Status.ACTIVE : Status.INACTIVE,
                        )
                      }
                      color="default"
                      sx={{
                        overflow: "visible",
                        scale: 1.5,
                        "& .MuiSwitch-switchBase.Mui-checked": {
                          color: "white",
                          hover: "none",
                          "& + .MuiSwitch-track": {
                            backgroundColor: "#C8102E",
                            opacity: 1,
                          },
                        },
                        "& .MuiSwitch-track": {
                          backgroundColor: "#bdbdbd",
                        },
                      }}
                      inputProps={{
                        "aria-label": "Mark profile inactive",
                      }}
                    />
                  }
                  label=""
                />

                <Note className="w-full font-lato !text-base !text-black">
                  Marking your profile inactive will make you invisible on the
                  map and disables sending messages from this profile. Profiles
                  are automatically marked inactive at the end of the of the
                  user&apos;s co-op period.
                </Note>
              </div>
            )}
          />
        )}

        <EntryLabel
          label="Co-op Term Dates"
          className={"mb-6 mt-12 !text-2xl"}
        />

        {/* Date pickers stack on mobile for better fit */}
        <div
          className={`flex ${isMobile ? "flex-col gap-4" : "w-2/3 gap-8 lg:w-full"}`}
        >
          <div className="flex flex-1 flex-col">
            <EntryLabel
              required={!isViewer}
              error={errors.coopStartDate}
              label="Start Date"
              className={"!text-lg"}
            />
            <DatePicker<Dayjs>
              id="coopStartDate"
              picker="month"
              disabled={isViewer}
              {...(watch("coopStartDate") && {
                defaultValue: dayjs(
                  formatDateToMonth(watch("coopStartDate") ?? null),
                  "YYYY/MM",
                ),
              })}
              onChange={(date: Dayjs, dateString) =>
                setValue("coopStartDate", date ? date.toDate() : null)
              }
              format="YYYY-MM"
              className="h-14 text-lg w-full border rounded-md p-2"
            />
          </div>

          <div className="flex flex-1 flex-col">
            <EntryLabel
              required={!isViewer}
              error={errors.coopEndDate}
              label="End Date"
              className={"!text-lg"}
            />
            <DatePicker<Dayjs>
              id="coopEndDate"
              picker="month"
              disabled={isViewer}
              {...(watch("coopEndDate") && {
                defaultValue: dayjs(
                  formatDateToMonth(watch("coopEndDate") ?? null),
                  "YYYY/MM",
                ),
              })}
              onChange={(date: Dayjs, dateString) =>
                setValue("coopEndDate", date ? date.toDate() : null)
              }
              format="YYYY-MM"
              className="h-14 text-lg w-full border rounded-md p-2"
            />
          </div>
        </div>

        <Note className="py-2">
          Please indicate the start and the end dates of your co-op. If you
          don&apos;t know exact dates, you can use approximate dates.
        </Note>

        <div className="py-8 font-montserrat">
          <button
            type="button"
            className="w-full rounded-lg bg-northeastern-red py-3 text-lg text-white hover:bg-red-700"
            onClick={onSubmit}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountSection;
