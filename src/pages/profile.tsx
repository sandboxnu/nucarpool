import { zodResolver } from "@hookform/resolvers/zod";
import _, { debounce } from "lodash";
import { GetServerSideProps, GetServerSidePropsContext, NextPage } from "next";
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
import DayBox from "../components/Profile/DayBox";
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
import ControlledTimePicker from "../components/Profile/ControlledTimePicker";
import { CarpoolAddress, CarpoolFeature } from "../utils/types";
import { EntryLabel } from "../components/EntryLabel";
import ControlledAddressCombobox from "../components/Profile/ControlledAddressCombobox";
import { getSession, useSession } from "next-auth/react";
import { createPortal } from "react-dom";
import { ComplianceModal } from "../components/CompliancePortal";

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

const custom = z.ZodIssueCode.custom;
const onboardSchema = z
  .object({
    role: z.nativeEnum(Role),
    seatAvail: z.number().int().nonnegative().max(6).optional(),
    companyName: z.string().optional(),
    companyAddress: z.string().optional(),
    startAddress: z.string().optional(),
    preferredName: z.string().optional(),
    pronouns: z.string().optional(),
    daysWorking: z.array(z.boolean()).optional(),
    bio: z.string().optional(),
    startTime: z.date().optional(),
    endTime: z.date().optional(),
    timeDiffers: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role !== Role.VIEWER) {
      if (!data.seatAvail && data.seatAvail !== 0)
        ctx.addIssue({
          code: custom,
          path: ["seatAvail"],
          message: "Cannot be empty",
        });
      if (data.companyName?.length === 0)
        ctx.addIssue({
          code: custom,
          path: ["companyName"],
          message: "Cannot be empty",
        });
      if (data.companyAddress?.length === 0)
        ctx.addIssue({
          code: custom,
          path: ["companyAddress"],
          message: "Cannot be empty",
        });
      if (data.startAddress?.length === 0)
        ctx.addIssue({
          code: custom,
          path: ["startAddress"],
          message: "Cannot be empty",
        });
      if (!data.daysWorking?.some(Boolean))
        ctx.addIssue({
          code: custom,
          path: ["daysWorking"],
          message: "Select at least one day",
        });

      if (!data.timeDiffers) {
        if (!data.startTime)
          ctx.addIssue({
            code: custom,
            path: ["startTime"],
            message: "Start time must be provided",
          });
        if (!data.endTime)
          ctx.addIssue({
            code: custom,
            path: ["endTime"],
            message: "End time must be provided",
          });
      }
    }
  });

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
    props: {},
  };
}
const Profile: NextPage = () => {
  const router = useRouter();
  const utils = trpc.useContext();
  const { data: session } = useSession();
  const { data: user } = trpc.user.me.useQuery(undefined, {
    refetchOnMount: true,
  });
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
  const role = watch("role");
  const isViewer = role === "VIEWER";

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
      utils.mapbox.geoJsonUserList.invalidate();
      utils.user.invalidate();
      utils.user.recommendations.me.refetch();
      utils.mapbox.geoJsonUserList.refetch();
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

    const sessionName = session?.user?.name ?? "";

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
      preferredName: userInfo.preferredName
        ? userInfo.preferredName
        : sessionName,
      pronouns: userInfo.pronouns,
      daysWorking: daysWorkingParsed,
      startTime: userInfo.startTime?.toISOString(),
      endTime: userInfo.endTime?.toISOString(),
      bio: userInfo.bio,
      licenseSigned: true,
    });
  };

  return (
    <>
      {!user?.licenseSigned && <ComplianceModal />}
      <div className="flex h-full w-full flex-col items-center">
        <Header />
        <ProfileContainer onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col items-center justify-center md:w-10/12">
            <div className="flex flex-col items-center justify-center gap-8 md:gap-12 lg:flex-row lg:items-start">
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
                    isDisabled={isViewer}
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
                </MiddleProfileSection>
                {/* Role field  */}
                <BottomProfileSection>
                  <ProfileHeaderNoMB>
                    I am a... <span className="text-northeastern-red">*</span>
                  </ProfileHeaderNoMB>
                  <div className="flex h-24 items-end space-x-4">
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
                          {...register("seatAvail", { valueAsNumber: true })}
                        />
                      </div>
                    )}
                  </div>
                  <Note>
                    {watch("role") === Role.DRIVER && (
                      <span>
                        Registering 0 available seats will remove you from the
                        app&apos;s recommendation generation.
                      </span>
                    )}
                    {isViewer && (
                      <span>
                        As a viewer, you can see other riders and drivers on the
                        map but cannot request a ride.
                      </span>
                    )}
                  </Note>
                </BottomProfileSection>
              </ProfileColumn>

              <ProfileColumn>
                <CommutingScheduleSection>
                  <ProfileHeader>Commuting Schedule</ProfileHeader>
                  {/* Days working field  */}
                  <div className="mb-2 aspect-[7/1] w-full max-w-[360px] md:my-4">
                    <div className="flex h-full w-full items-center justify-evenly border-l border-l-black">
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
                      <ErrorDisplay>{errors.daysWorking.message}</ErrorDisplay>
                    )}
                  </div>

                  {/* Start/End Time Fields  */}
                  <div className="flex w-full justify-between gap-6 pb-4 md:w-96">
                    <div className="flex flex-1 flex-col gap-2">
                      <EntryLabel
                        required={true}
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
                        required={true}
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
                    If you don&apos;t have set times, communicate that on your
                    own with potential riders/drivers. For start/end time, enter
                    whatever best matches your work schedule.
                  </Note>
                  <div className="flex flex-col space-y-2"></div>
                </CommutingScheduleSection>

                <PersonalInfoSection>
                  <ProfileHeader>Personal Info</ProfileHeader>
                  <div className="flex w-full flex-row space-x-6">
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
                        isDisabled={watch("role") == Role.VIEWER}
                        type="text"
                        {...register("pronouns")}
                      />
                    </div>
                  </div>
                  {/* Bio field */}
                  <div className="w-full py-4">
                    <EntryLabel
                      required
                      error={errors.companyAddress}
                      label="About Me"
                    />
                    <textarea
                      className={`form-input w-full resize-none rounded-md
                       ${
                         watch("role") == Role.VIEWER
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
