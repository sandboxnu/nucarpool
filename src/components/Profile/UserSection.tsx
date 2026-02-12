import { ErrorDisplay, Note, ProfileHeader } from "../../styles/profile";
import Radio from "../Radio";
import { Role } from "@prisma/client";
import { EntryLabel } from "../EntryLabel";
import { TextField } from "../TextField";
import {
  FieldErrors,
  UseFormHandleSubmit,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import { OnboardingFormInputs } from "../../utils/types";
import ProfilePicture from "./ProfilePicture";
import useIsMobile from "../../utils/useIsMobile";

interface UserSectionProps {
  register: UseFormRegister<OnboardingFormInputs>;
  errors: FieldErrors<OnboardingFormInputs>;
  setValue: UseFormSetValue<OnboardingFormInputs>;
  watch: UseFormWatch<OnboardingFormInputs>;
  onSubmit: ReturnType<UseFormHandleSubmit<OnboardingFormInputs>>;

  onFileSelect: (file: File | null) => void;
}

const UserSection = ({
  errors,
  watch,
  register,
  onSubmit,
  setValue,
  onFileSelect,
}: UserSectionProps) => {
  const isMobile = useIsMobile();
  const isViewer = watch("role") === Role.VIEWER;

  return (
    <div className="relative z-10 flex h-full flex-col justify-start">
      <ProfileHeader className={isMobile ? "!text-2xl" : "!text-4xl"}>
        User Profile
      </ProfileHeader>

      <div className="flex font-montserrat text-2xl font-bold">
        I am a... <span className="text-northeastern-red">*</span>
      </div>

      {/* Fixed layout issues */}
      <div
        className={`${isMobile ? "flex-col" : "flex h-24 w-[700px]"} max-w-full items-end`}
      >
        {/* Radio buttons always in a row */}
        <div className="flex gap-8">
          <Radio
            label="Viewer"
            id="viewer"
            error={errors.role}
            role={Role.VIEWER}
            value={Role.VIEWER}
            currentlySelected={watch("role")}
            {...register("role")}
          />
          <Radio
            label="Rider"
            id="rider"
            error={errors.role}
            role={Role.RIDER}
            value={Role.RIDER}
            currentlySelected={watch("role")}
            {...register("role")}
          />
          <Radio
            label="Driver"
            id="driver"
            error={errors.role}
            role={Role.DRIVER}
            value={Role.DRIVER}
            currentlySelected={watch("role")}
            {...register("role")}
          />
        </div>

        {/* Reduced gap between radio buttons and seat availability */}
        {watch("role") == Role.DRIVER && (
          <div
            className={`${isMobile ? "w-full mt-2" : "flex-1"} flex flex-col`}
          >
            <EntryLabel
              required={true}
              error={errors.seatAvail}
              label="Seat Availability"
            />
            <div className="flex flex-col gap-1">
              <TextField
                inputClassName="h-14 text-lg"
                className="w-full self-end"
                label="Seat Availability"
                id="seatAvail"
                type="number"
                min="0"
                {...register("seatAvail", { valueAsNumber: true })}
              />
            </div>
          </div>
        )}
      </div>

      <div className="my-2 flex w-full justify-between">
        <Note>
          {watch("role") === Role.DRIVER && (
            <span>Looking for Carpoolers to join you.</span>
          )}
          {watch("role") === Role.RIDER && (
            <span>Looking for a Carpool to join.</span>
          )}
          {watch("role") === Role.VIEWER && (
            <span>
              As a viewer, you can see other riders and drivers on the map but
              cannot request a ride.
            </span>
          )}
        </Note>
        {errors.seatAvail && watch("role") === Role.DRIVER && (
          <ErrorDisplay>{errors.seatAvail.message}</ErrorDisplay>
        )}
      </div>

      <EntryLabel label="Personal Info" className="mb-4 mt-6 !text-2xl" />

      {/* Profile picture section */}
      <div
        className={`mb-12 ${isMobile ? "flex flex-col items-start" : "ml-10"} w-full`}
      >
        <ProfilePicture onFileSelected={onFileSelect} />
      </div>

      <div
        className={`flex w-full ${isMobile ? "flex-col space-y-4" : "flex-row space-x-6"}`}
      >
        <div className={`${isMobile ? "w-full" : "w-3/5"} flex flex-col`}>
          <EntryLabel
            error={errors.preferredName}
            label="Preferred Name"
            className={"!text-lg"}
          />
          <TextField
            id="preferredName"
            error={errors.preferredName}
            isDisabled={isViewer}
            type="text"
            inputClassName={`h-12`}
            {...register("preferredName")}
          />
        </div>

        <div className={`${isMobile ? "w-full" : "w-2/6 flex-1"}`}>
          <EntryLabel
            error={errors.pronouns}
            label="Pronouns"
            className={"!text-lg"}
          />
          <TextField
            id="pronouns"
            inputClassName={`h-12`}
            error={errors.pronouns}
            charLimit={20}
            isDisabled={isViewer}
            defaultValue={watch("pronouns") ? `(${watch("pronouns")})` : ""}
            type="text"
            onChange={(e: any) => {
              const input = e.target;
              const cursorPosition = input.selectionStart || 0;
              const sanitizedValue = input.value.replace(/[()]/g, "");
              const displayValue = sanitizedValue ? `(${sanitizedValue})` : "";
              setValue("pronouns", sanitizedValue, {
                shouldValidate: true,
              });
              input.value = displayValue;
              const adjustedCursor = Math.min(
                cursorPosition + 1,
                displayValue.length - 1,
              );
              input.setSelectionRange(adjustedCursor, adjustedCursor);
            }}
          />
        </div>
      </div>

      <div className="w-full py-4">
        <EntryLabel
          error={errors.bio}
          label="About Me"
          className={"!text-lg"}
        />
        <textarea
          className={`form-input w-full resize-none rounded-md
                       ${
                         isViewer
                           ? "border-gray-100 bg-gray-200 text-gray-400"
                           : ""
                       } border-black px-3 py-2`}
          maxLength={188}
          disabled={isViewer}
          {...register("bio")}
        />
        <Note>
          This intro will be shared with people you choose to connect with.
        </Note>
      </div>

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
  );
};

export default UserSection;
