import { zodResolver } from "@hookform/resolvers/zod";
import _, { debounce } from "lodash";
import { GetServerSidePropsContext, NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import Header from "../components/Header";
import { z } from "zod";
import { trpc } from "../utils/trpc";
import { Role, Status } from "@prisma/client";
import { TextField } from "../components/TextField";
import Radio from "../components/Radio";
import useSearch from "../utils/search";
import Checkbox from "@mui/material/Checkbox";
import DayBox from "../components/DayBox";
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
} from "../styles/profile";
import ControlledTimePicker from "../components/ControlledTimePicker";
import { CarpoolAddress, CarpoolFeature } from "../utils/types";
import { EntryLabel } from "../components/EntryLabel";
import ControlledAddressCombobox from "../components/ControlledAddressCombobox";
import { getSession } from "next-auth/react";

// Inputs to the onboarding form.
export type OnboardingFormInputs = {
  role: Role;
  seatAvail: number;
  companyName: string;
  companyAddress: string;
  startAddress: string;
  preferredName: string;
  pronouns: string;
  daysWorking: boolean[];
  startTime: Date | null;
  endTime: Date | null;
  timeDiffers: boolean;
  bio: string;
};

const dateErrorMap: z.ZodErrorMap = (issue, ctx) => {
  return { message: "Invalid time" };
};

const onboardSchema = z.intersection(
  z.object({
    role: z.nativeEnum(Role),
    seatAvail: z
      .number({ invalid_type_error: "Cannot be empty" })
      .int("Must be an integer")
      .nonnegative("Must be greater or equal to 0")
      .max(6),
    companyName: z.string().min(1, "Cannot be empty"),
    companyAddress: z.string().min(1, "Cannot be empty"),
    startAddress: z.string().min(1, "Cannot be empty"),
    preferredName: z.string(),
    pronouns: z.string(),
    daysWorking: z
      .array(z.boolean())
      .refine((a) => a.some((b) => b), { message: "Select at least one day" }), // Make this regex.
    bio: z.string(),
  }),
  z.union([
    z.object({
      startTime: z.date({ errorMap: dateErrorMap }),
      endTime: z.date({ errorMap: dateErrorMap }),
      timeDiffers: z.literal(false),
    }),
    z.object({
      timeDiffers: z.literal(true),
    }),
  ])
);

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

  return {
    props: {}, // will be passed to the page component as props
  };
}
const Profile: NextPage = () => {
  const router = useRouter();
  const {
    register,
    formState: { errors },
    watch,
    handleSubmit,
    reset,
    control,
  } = useForm<OnboardingFormInputs>({
    mode: "onSubmit",
    defaultValues: {
      role: Role.RIDER,
      seatAvail: 0,
      companyName: "",
      companyAddress: "",
      startAddress: "",
      preferredName: "",
      pronouns: "",
      daysWorking: [false, false, false, false, false, false, false],
      startTime: undefined,
      endTime: undefined,
      timeDiffers: false,
      bio: "",
    },
    resolver: zodResolver(onboardSchema),
  });
  const { data: user } = trpc.user.me.useQuery(undefined, {
    refetchOnMount: true,
  });

  const [companyAddressSuggestions, setCompanyAddressSuggestions] = useState<
    CarpoolFeature[]
  >([]);
  const [startAddressSuggestions, setStartAddressSuggestions] = useState<
    CarpoolFeature[]
  >([]);

  const [companyAddressSelected, setCompanyAddressSelected] =
    useState<CarpoolAddress>({
      place_name: "",
      center: [0, 0],
    });
  const [startAddressSelected, setStartAddressSelected] =
    useState<CarpoolAddress>({
      place_name: "",
      center: [0, 0],
    });

  const [companyAddress, setCompanyAddress] = useState("");
  const updateCompanyAddress = useMemo(
    () => debounce(setCompanyAddress, 250),
    []
  );

  const [startingAddress, setStartingAddress] = useState("");
  const updateStartingAddress = useMemo(
    () => debounce(setStartingAddress, 250),
    []
  );

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
      companyName: user.companyName,
      companyAddress: user.companyAddress,
      startAddress: user.startAddress,
      preferredName: user.preferredName,
      pronouns: user.pronouns,
      daysWorking: user.daysWorking.split(",").map((bit) => bit === "1"),
      startTime: user.startTime,
      endTime: user.endTime,
      timeDiffers: false,
      bio: user.bio,
    });
  }, [user]);

  useSearch({
    value: companyAddress,
    type: "address%2Cpostcode",
    setFunc: setCompanyAddressSuggestions,
  });

  useSearch({
    value: startingAddress,
    type: "address%2Cpostcode",
    setFunc: setStartAddressSuggestions,
  });

  const editUserMutation = trpc.user.edit.useMutation({
    onSuccess: () => {
      router.push("/");
    },
    onError: (error) => {
      toast.error(`Something went wrong: ${error.message}`);
    },
  });

  const onSubmit = async (values: OnboardingFormInputs) => {
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

    const daysWorkingParsed: string = userInfo.daysWorking
      .map((val: boolean) => {
        if (val) {
          return "1";
        } else {
          return "0";
        }
      })
      .join(",");

    editUserMutation.mutate({
      role: userInfo.role,
      status: Status.ACTIVE,
      seatAvail: userInfo.seatAvail,
      companyName: userInfo.companyName,
      companyAddress: userInfo.companyAddress,
      companyCoordLng: userInfo.companyCoordLng!,
      companyCoordLat: userInfo.companyCoordLat!,
      startAddress: userInfo.startAddress,
      startCoordLng: userInfo.startCoordLng!,
      startCoordLat: userInfo.startCoordLat!,
      isOnboarded: true,
      preferredName: userInfo.preferredName,
      pronouns: userInfo.pronouns,
      daysWorking: daysWorkingParsed,
      startTime: userInfo.startTime?.toISOString(),
      endTime: userInfo.endTime?.toISOString(),
      bio: userInfo.bio,
    });
  };

  return (
    <>
      <div className="flex flex-col h-full w-full items-center">
        <Header />
        <ProfileContainer onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col justify-center items-center md:w-10/12">
            <div className="flex flex-col gap-8 md:gap-12 lg:flex-row lg:items-start justify-center items-center">
              <ProfileColumn>
                <TopProfileSection>
                  <ProfileHeader>Locations</ProfileHeader>
                  {/* Starting Location field  */}
                  <EntryLabel
                    required={true}
                    error={errors.startAddress}
                    label="Home Address"
                  />
                  <div>
                    <ControlledAddressCombobox
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
                </TopProfileSection>

                <MiddleProfileSection>
                  <EntryLabel
                    required={true}
                    error={errors.companyName}
                    label="Workplace Name"
                  />
                  <TextField
                    className={`w-full`}
                    inputClassName={`h-12`}
                    label="Workplace Name"
                    id="companyName"
                    error={errors.companyName}
                    type="text"
                    {...register("companyName")}
                  />
                  {/* Company Address field  */}
                  <EntryLabel
                    required={true}
                    error={errors.companyAddress}
                    label="Workplace Address"
                  />
                  <Note>
                    Note: Select the autocomplete results, even if you typed the
                    address out
                  </Note>
                  <ControlledAddressCombobox
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
                </MiddleProfileSection>

                {/* Role field  */}
                <BottomProfileSection>
                  <ProfileHeaderNoMB>
                    I am a... <span className="text-northeastern-red">*</span>
                  </ProfileHeaderNoMB>
                  <div className="flex items-end space-x-4">
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
                      <div className="flex flex-col flex-1">
                        <EntryLabel
                          required={true}
                          error={errors.seatAvail}
                          label="Seat availability"
                        />
                        <TextField
                          inputClassName="py-[14px] h-14 text-lg"
                          className="self-end w-full"
                          label="Seat Availability"
                          id="seatAvail"
                          error={errors.seatAvail}
                          type="number"
                          {...register("seatAvail", { valueAsNumber: true })}
                        />
                      </div>
                    )}
                  </div>
                  {watch("role") == Role.DRIVER && (
                    <Note>
                      Registering 0 available seats will remove you from the
                      app&apos;s recommendaiton generation.
                    </Note>
                  )}
                </BottomProfileSection>
              </ProfileColumn>

              <ProfileColumn>
                <CommutingScheduleSection>
                  <ProfileHeader>Commuting Schedule</ProfileHeader>
                  {/* Days working field  */}
                  <div className="mb-2 md:my-4 w-full aspect-[7/1] max-w-[360px]">
                    <div className="w-full h-full border-l flex justify-evenly items-center border-l-black">
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
                                aspectRatio: 1 / 1,
                                width: 1,
                                height: 1,
                                padding: 0,
                              }}
                              checked={value}
                              onChange={onChange}
                              checkedIcon={
                                <DayBox day={day} isSelected={true} />
                              }
                              icon={<DayBox day={day} isSelected={false} />}
                              defaultChecked={
                                !!defaultValues?.daysWorking ? true : false
                              }
                            />
                          )}
                        />
                      ))}
                    </div>

                    {errors.daysWorking && (
                      <ErrorDisplay>{errors.daysWorking.message}</ErrorDisplay>
                    )}
                  </div>

                  {/* Start/End Time Fields  */}
                  <div className="flex w-full md:w-96 gap-6 pb-4 justify-between">
                    <div className="flex flex-col gap-2 flex-1">
                      <EntryLabel
                        required={true}
                        error={errors.startTime}
                        label="Start Time"
                      />
                      <ControlledTimePicker
                        control={control}
                        name={"startTime"}
                        value={user?.startTime ? user.startTime : undefined}
                      />
                    </div>
                    <div className="flex flex-col gap-2 flex-1">
                      <EntryLabel
                        required={true}
                        error={errors.endTime}
                        label="End Time"
                      />
                      <ControlledTimePicker
                        control={control}
                        name={"endTime"}
                        value={user?.endTime ? user.endTime : undefined}
                      />
                    </div>
                  </div>
                  <Note className="md:w-96">
                    If you don&apos;t have set times, communicate that on your
                    own with potential riders/drivers. For start/end time, enter
                    whatever best matches your work schedule.
                  </Note>
                  <div className="flex flex-col space-y-2">
                    <div className="flex flex-row items-center"></div>
                  </div>
                </CommutingScheduleSection>

                <PersonalInfoSection>
                  <ProfileHeader>Personal Info</ProfileHeader>
                  <div className="flex flex-row space-x-6 w-full">
                    {/* Preferred Name field  */}
                    <div className="flex flex-col w-3/5">
                      <LightEntryLabel error={!!errors.preferredName}>
                        Preferred Name
                      </LightEntryLabel>
                      <TextField
                        id="preferredName"
                        error={errors.preferredName}
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
                        type="text"
                        {...register("pronouns")}
                      />
                    </div>
                  </div>
                  {/* Bio field */}
                  <div className="py-4 w-full">
                    <EntryLabel
                      required
                      error={errors.companyAddress}
                      label="About Me"
                    />
                    <textarea
                      className={`resize-none form-input w-full rounded-md px-3 py-2 border-black`}
                      maxLength={300}
                      {...register("bio")}
                    />
                    <Note>
                      This intro will be shared with people you choose to
                      connect with.
                    </Note>
                  </div>
                </PersonalInfoSection>
              </ProfileColumn>
            </div>
            <CompleteProfileButton type="submit">
              Complete Profile
            </CompleteProfileButton>
          </div>
        </ProfileContainer>
      </div>
    </>
  );
};

export default Profile;
