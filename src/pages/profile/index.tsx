import { zodResolver } from "@hookform/resolvers/zod";
import { GetServerSidePropsContext, NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import FormControlLabel from "@mui/material/FormControlLabel";
import Header from "../../components/Header";
import { trpc } from "../../utils/trpc";
import { Role, Status } from "@prisma/client";
import { TextField } from "../../components/TextField";
import Radio from "../../components/Radio";
import Checkbox from "@mui/material/Checkbox";
import DayBox from "../../components/Profile/DayBox";
import {
  BottomProfileSection,
  CompleteProfileButton,
  MiddleProfileSection,
  PersonalInfoSection,
  ProfileColumn,
  ProfileContainer,
  ProfileHeader,
  TopProfileSection,
  CommutingScheduleSection,
  LightEntryLabel,
  Note,
  ErrorDisplay,
  ProfileHeaderNoMB,
} from "../../styles/profile";
import ControlledTimePicker from "../../components/Profile/ControlledTimePicker";
import { OnboardingFormInputs } from "../../utils/types";
import { EntryLabel } from "../../components/EntryLabel";
import ControlledAddressCombobox from "../../components/Profile/ControlledAddressCombobox";
import { getSession, useSession } from "next-auth/react";
import { ComplianceModal } from "../../components/CompliancePortal";
import ProfilePicture from "../../components/Profile/ProfilePicture";
import Spinner from "../../components/Spinner";
import { trackProfileCompletion } from "../../utils/mixpanel";
import {
  onboardSchema,
  profileDefaultValues,
} from "../../utils/profile/zodSchema";
import { useUploadFile } from "../../utils/profile/useUploadFile";
import { formatDateToMonth, handleMonthChange } from "../../utils/dateUtils";
import { useAddressSelection } from "../../utils/useAddressSelection";
import {
  updateUser,
  useEditUserMutation,
} from "../../utils/profile/updateUser";

// Inputs to the onboarding form.

const daysOfWeek = ["Su", "M", "Tu", "W", "Th", "F", "S"];

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getSession(context);

  if (!session?.user) {
    return {
      redirect: {
        destination: "/sign-in",
        permanent: false,
      },
    };
  }
  if (!session?.user.isOnboarded) {
    return {
      redirect: {
        destination: "/profile/setup",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
}
const Index: NextPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const editUserMutation = useEditUserMutation(router, () =>
    setIsLoading(false)
  );

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { uploadFile, error } = useUploadFile(selectedFile);

  const { data: session } = useSession();
  const { data: user } = trpc.user.me.useQuery(undefined, {
    refetchOnMount: true,
  });
  const {
    register,
    setValue,
    formState: { errors },
    watch,
    handleSubmit,
    reset,
    control,
  } = useForm<OnboardingFormInputs>({
    mode: "onSubmit",
    defaultValues: profileDefaultValues,
    resolver: zodResolver(onboardSchema),
  });
  const role = watch("role");
  const isViewer = role === "VIEWER";

  const {
    selectedAddress: startAddressSelected,
    setSelectedAddress: setStartAddressSelected,
    updateAddress: updateStartingAddress,
    suggestions: startAddressSuggestions,
  } = useAddressSelection();

  const {
    selectedAddress: companyAddressSelected,
    setSelectedAddress: setCompanyAddressSelected,
    updateAddress: updateCompanyAddress,
    suggestions: companyAddressSuggestions,
  } = useAddressSelection();

  useEffect(() => {
    if (!user) return;

    setStartAddressSelected({
      place_name: user.startAddress,
      center: [user.startCoordLng, user.startCoordLat],
    });
    setCompanyAddressSelected({
      place_name: user.companyAddress,
      center: [user.companyCoordLng, user.companyCoordLat],
    });

    reset({
      role: user.role,
      seatAvail: user.seatAvail,
      status: user.status,
      companyName: user.companyName,
      companyAddress: user.companyAddress,
      startAddress: user.startAddress,
      preferredName: user.preferredName,
      pronouns: user.pronouns,
      daysWorking: user.daysWorking.split(",").map((bit) => bit === "1"),
      startTime: user.startTime,
      endTime: user.endTime,
      coopStartDate: user.coopStartDate!,
      coopEndDate: user.coopEndDate!,
      bio: user.bio,
    });
  }, [user]);

  const onSubmit = async (values: OnboardingFormInputs) => {
    setIsLoading(true);
    const coord: number[] = companyAddressSelected.center;
    const startCoord: number[] = startAddressSelected.center;
    const userInfo = {
      ...values,
      companyCoordLng: coord[0],
      companyCoordLat: coord[1],
      startCoordLng: startCoord[0],
      startCoordLat: startCoord[1],
      seatAvail: values.role === Role.RIDER ? 0 : values.seatAvail,
    };

    const sessionName = session?.user?.name ?? "";
    if (selectedFile) {
      try {
        await uploadFile();
      } catch (error) {
        console.error("File upload failed:", error);
      }
    }
    await updateUser({
      userInfo,
      sessionName,
      mutation: editUserMutation,
    });
    trackProfileCompletion(userInfo.role, userInfo.status);
  };

  if (isLoading || !user) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white ">
        <Spinner />
      </div>
    );
  }
  return (
    <>
      {!user?.licenseSigned && <ComplianceModal />}
      <div className="flex h-full w-full flex-col items-center">
        <Header />
        <ProfileContainer onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col items-center justify-center md:w-10/12">
            <div className="flex flex-col items-center justify-center gap-8  lg:flex-row lg:items-start">
              <ProfileColumn>
                <TopProfileSection>
                  <ProfileHeaderNoMB>
                    I am a... <span className="text-northeastern-red">*</span>
                  </ProfileHeaderNoMB>
                  <div className="flex h-20 items-end space-x-4">
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

                    {watch("role") == Role.DRIVER && (
                      <div className="flex flex-1 flex-col">
                        <EntryLabel
                          required={true}
                          error={errors.seatAvail}
                          label="Seat availability"
                        />
                        <TextField
                          inputClassName="py-[14px] h-14 text-lg"
                          className="w-full self-end"
                          label="Seat Availability"
                          id="seatAvail"
                          error={errors.seatAvail}
                          type="number"
                          min="0"
                          {...register("seatAvail", { valueAsNumber: true })}
                        />
                      </div>
                    )}
                  </div>
                  <Note>
                    {watch("role") === Role.DRIVER && (
                      <span>Looking for Carpoolers to join you.</span>
                    )}
                    {watch("role") === Role.RIDER && (
                      <span>Looking for a Carpool to join.</span>
                    )}
                    {isViewer && (
                      <span>
                        As a viewer, you can see other riders and drivers on the
                        map but cannot request a ride.
                      </span>
                    )}
                  </Note>
                </TopProfileSection>

                <MiddleProfileSection>
                  <ProfileHeader>Locations</ProfileHeader>
                  {/* Starting Location field  */}
                  <EntryLabel
                    required={!isViewer}
                    error={errors.startAddress}
                    label="Home Address"
                  />
                  <div>
                    <ControlledAddressCombobox
                      isDisabled={isViewer}
                      control={control}
                      name={"startAddress"}
                      addressSelected={startAddressSelected}
                      addressSetter={setStartAddressSelected}
                      addressSuggestions={startAddressSuggestions}
                      error={errors.startAddress}
                      addressUpdater={updateStartingAddress}
                    />

                    <Note className="pt-2">
                      Note: Your address will only be used to find users close
                      to you. It will not be displayed to any other users.
                    </Note>
                  </div>
                  {errors.startAddress && (
                    <ErrorDisplay>{errors.startAddress.message}</ErrorDisplay>
                  )}
                </MiddleProfileSection>
                <BottomProfileSection>
                  <EntryLabel
                    required={!isViewer}
                    error={errors.companyName}
                    label="Workplace Name"
                  />
                  <TextField
                    className={`w-full`}
                    inputClassName={`h-12`}
                    label="Workplace Name"
                    isDisabled={isViewer}
                    id="companyName"
                    error={errors.companyName}
                    type="text"
                    {...register("companyName")}
                  />
                  {/* Company Address field  */}
                  <EntryLabel
                    required={!isViewer}
                    error={errors.companyAddress}
                    label="Workplace Address"
                  />
                  <Note>
                    Note: Select the autocomplete results, even if you typed the
                    address out
                  </Note>
                  <ControlledAddressCombobox
                    isDisabled={isViewer}
                    control={control}
                    name={"companyAddress"}
                    addressSelected={companyAddressSelected}
                    addressSetter={setCompanyAddressSelected}
                    addressSuggestions={companyAddressSuggestions}
                    error={errors.companyAddress}
                    addressUpdater={updateCompanyAddress}
                  />
                  {errors.companyAddress && (
                    <ErrorDisplay>{errors.companyAddress.message}</ErrorDisplay>
                  )}
                  <CommutingScheduleSection>
                    <ProfileHeader className={"mt-4"}>
                      Commuting Schedule
                    </ProfileHeader>
                    {/* Days working field  */}
                    <div className="mb-2  aspect-[7/1] w-full max-w-[360px] md:my-4">
                      <div className="flex h-full w-full items-center justify-evenly ">
                        {daysOfWeek.map((day, index) => (
                          <Controller
                            key={day + index.toString()}
                            name={`daysWorking.${index}`}
                            control={control}
                            render={({
                              field: { onChange, value },
                              formState: { defaultValues },
                            }) => (
                              <Checkbox
                                key={day + index.toString()}
                                sx={{
                                  input: { width: 1, height: 1 },
                                  aspectRatio: 1,
                                  width: 1,
                                  height: 1,
                                  padding: 0,
                                }}
                                disabled={isViewer}
                                checked={value}
                                onChange={onChange}
                                checkedIcon={
                                  <DayBox day={day} isSelected={true} />
                                }
                                icon={<DayBox day={day} isSelected={false} />}
                              />
                            )}
                          />
                        ))}
                      </div>

                      {errors.daysWorking && (
                        <ErrorDisplay>
                          {errors.daysWorking.message}
                        </ErrorDisplay>
                      )}
                    </div>

                    {/* Start/End Time Fields  */}
                    <div className="flex w-full justify-between gap-6 pb-4 md:w-96">
                      <div className="flex flex-1 flex-col gap-2">
                        <EntryLabel
                          required={!isViewer}
                          error={errors.startTime}
                          label="Start Time"
                        />
                        <ControlledTimePicker
                          isDisabled={isViewer}
                          control={control}
                          name={"startTime"}
                          value={user?.startTime ? user.startTime : undefined}
                        />
                      </div>
                      <div className="flex flex-1 flex-col gap-2">
                        <EntryLabel
                          required={!isViewer}
                          error={errors.endTime}
                          label="End Time"
                        />
                        <ControlledTimePicker
                          isDisabled={isViewer}
                          control={control}
                          name={"endTime"}
                          value={user?.endTime ? user.endTime : undefined}
                        />
                      </div>
                    </div>
                    <Note className="py-4 md:w-96">
                      Please input the start and end times of your work, rather
                      than your departure times. If your work hours are
                      flexible, coordinate directly with potential riders or
                      drivers to inform them.
                    </Note>
                  </CommutingScheduleSection>
                </BottomProfileSection>
              </ProfileColumn>

              <ProfileColumn>
                <ProfileHeader>Co-op Term Dates </ProfileHeader>
                <div className="flex w-2/3 gap-8 lg:w-full">
                  <div className="flex flex-1 flex-col">
                    <EntryLabel
                      required={!isViewer}
                      error={errors.coopStartDate}
                      label="Start Date"
                    />
                    <TextField
                      type="month"
                      inputClassName="h-14 text-lg"
                      isDisabled={isViewer}
                      id="coopStartDate"
                      error={errors.coopStartDate}
                      onChange={handleMonthChange("coopStartDate", setValue)}
                      defaultValue={
                        formatDateToMonth(watch("coopStartDate")) || undefined
                      }
                    />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <EntryLabel
                      required={!isViewer}
                      error={errors.coopEndDate}
                      label="End Date"
                    />
                    <TextField
                      type="month"
                      inputClassName="h-14 text-lg"
                      isDisabled={isViewer}
                      id="coopEndDate"
                      error={errors.coopEndDate}
                      onChange={handleMonthChange("coopEndDate", setValue)}
                      defaultValue={
                        formatDateToMonth(watch("coopEndDate")) || undefined
                      }
                    />
                  </div>
                </div>
                <Note className="py-2">
                  Please indicate the start and the end dates of your co-op. If
                  you don&apos;t know exact dates, you can use approximate
                  dates.
                </Note>

                <PersonalInfoSection>
                  <ProfileHeader>Personal Info</ProfileHeader>
                  <div className="flex w-full flex-col ">
                    <div className=" w-full ">
                      <ProfilePicture onFileSelected={setSelectedFile} />
                    </div>
                    <div className="mb-5 mt-2 w-full">
                      {!isViewer && (
                        <Controller
                          name="status"
                          control={control}
                          render={({ field }) => (
                            <div className="flex items-start">
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={field.value === Status.INACTIVE}
                                    onChange={(e) =>
                                      field.onChange(
                                        e.target.checked
                                          ? Status.INACTIVE
                                          : Status.ACTIVE
                                      )
                                    }
                                    inputProps={{
                                      "aria-label": "Mark profile inactive",
                                    }}
                                  />
                                }
                                label="Mark profile inactive"
                              />
                              <Note className="ml-2 w-1/2 text-sm text-gray-500">
                                Marking your profile inactive removes you from
                                the map for other users.
                                <strong className="font-semibold">
                                  &nbsp;You should leave this box unchecked if
                                  you&apos;re creating your profile for the
                                  first time.
                                </strong>
                              </Note>
                            </div>
                          )}
                        />
                      )}
                    </div>

                    <div className="flex w-full flex-row  space-x-6">
                      {/* Preferred Name field  */}

                      <div className="flex w-3/5 flex-col">
                        <LightEntryLabel error={!!errors.preferredName}>
                          Preferred Name
                        </LightEntryLabel>
                        <TextField
                          id="preferredName"
                          error={errors.preferredName}
                          isDisabled={isViewer}
                          type="text"
                          inputClassName={`h-12`}
                          {...register("preferredName")}
                        />
                      </div>

                      {/* Pronouns field  */}
                      <div className="w-2/6 flex-1">
                        <LightEntryLabel error={!!errors.pronouns}>
                          Pronouns
                        </LightEntryLabel>
                        <TextField
                          id="pronouns"
                          inputClassName={`h-12`}
                          error={errors.pronouns}
                          charLimit={20}
                          isDisabled={isViewer}
                          defaultValue={
                            watch("pronouns") ? `(${watch("pronouns")})` : ""
                          }
                          type="text"
                          onChange={(e: any) => {
                            const input = e.target;
                            const cursorPosition = input.selectionStart || 0;
                            const sanitizedValue = input.value.replace(
                              /[()]/g,
                              ""
                            );
                            const displayValue = sanitizedValue
                              ? `(${sanitizedValue})`
                              : "";
                            setValue("pronouns", sanitizedValue, {
                              shouldValidate: true,
                            });
                            input.value = displayValue;
                            // Reset cursor
                            const adjustedCursor = Math.min(
                              cursorPosition + 1,
                              displayValue.length - 1
                            );
                            input.setSelectionRange(
                              adjustedCursor,
                              adjustedCursor
                            );
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  {/* Bio field */}
                  <div className="w-full py-4">
                    <EntryLabel error={errors.bio} label="About Me" />
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
                      This intro will be shared with people you choose to
                      connect with.
                    </Note>
                  </div>
                </PersonalInfoSection>
                <CompleteProfileButton type="submit">
                  Complete Profile
                </CompleteProfileButton>
              </ProfileColumn>
            </div>
          </div>
        </ProfileContainer>
      </div>
    </>
  );
};

export default Index;
