import { Combobox, Transition } from "@headlessui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import _, { debounce } from "lodash";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { Fragment, useEffect, useMemo, useState } from "react";
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
import { Tooltip, Icon } from "@mui/material";
import { MdHelp } from "react-icons/md";
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
  EntryRow,
  LightEntryLabel,
  Note,
  ErrorDisplay,
  ProfileHeaderNoMB,
} from "../styles/profile";
import ControlledTimePicker from "../components/ControlledTimePicker";
import { CarpoolAddress, CarpoolFeature } from "../utils/types";
import ProtectedPage from "../utils/auth";
import { EntryLabel } from "../components/EntryLabel";

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
      .nonnegative("Must be greater or equal to 0"),
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
  const { data: user } = trpc.useQuery(["user.me"], { refetchOnMount: true });

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
    () => debounce(setCompanyAddress, 1000),
    []
  );

  const [startingAddress, setStartingAddress] = useState("");
  const updateStartingAddress = useMemo(
    () => debounce(setStartingAddress, 1000),
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

  const editUserMutation = trpc.useMutation("user.edit", {
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
      <div className="flex flex-col w-full h-full items-center">
        <Header />
        <ProfileContainer onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col flex-auto md:flex-row md:space-x-20">
            <ProfileColumn>
              <TopProfileSection>
                <ProfileHeader>Locations</ProfileHeader>
                {/* Starting Location field  */}
                <EntryLabel
                  required={true}
                  error={errors.startAddress}
                  label="Home Address"
                />
                <Controller
                  name="startAddress"
                  control={control}
                  render={({ field: { ref, ...fieldProps } }) => (
                    <Combobox
                      className={`w-full`}
                      as="div"
                      value={startAddressSelected}
                      onChange={(val: CarpoolFeature) => {
                        setStartAddressSelected(val);
                        fieldProps.onChange(val.place_name);
                      }}
                      ref={ref}
                    >
                      <Combobox.Input
                        className={`w-full shadow-sm rounded-md px-3 py-2 ${
                          errors.startAddress
                            ? "border-northeastern-red"
                            : "border-black"
                        }`}
                        displayValue={(feat: CarpoolAddress) =>
                          feat.place_name ? feat.place_name : ""
                        }
                        type="text"
                        onChange={(e) => {
                          if (e.target.value === "") {
                            setStartAddressSelected({
                              place_name: "",
                              center: [0, 0],
                            });
                            fieldProps.onChange("");
                          } else {
                            updateStartingAddress(e.target.value);
                          }
                        }}
                      />
                      <Transition
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                      >
                        <Combobox.Options className="w-full rounded-md bg-white text-base shadow-lg focus:outline-none ">
                          {startAddressSuggestions.length === 0 ? (
                            <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                              Nothing found.
                            </div>
                          ) : (
                            startAddressSuggestions.map((feat) => (
                              <Combobox.Option
                                key={feat.id}
                                className={({ active }) =>
                                  `w-full relative cursor-default select-none p-3 border-black ${
                                    active
                                      ? "bg-blue-400 text-white"
                                      : "text-gray-900"
                                  }`
                                }
                                value={feat}
                              >
                                {feat.place_name}
                              </Combobox.Option>
                            ))
                          )}
                        </Combobox.Options>
                      </Transition>
                    </Combobox>
                  )}
                />
                <Note>
                  Note: Your address will only be used to find users close to
                  you. It will not be displayed to any other users.
                </Note>
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
                  className={`w-full mb-6`}
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
                <Controller
                  name="companyAddress"
                  control={control}
                  render={({ field: { ref, ...fieldProps } }) => (
                    <Combobox
                      className={`w-full`}
                      as="div"
                      value={companyAddressSelected}
                      onChange={(val: CarpoolFeature) => {
                        setCompanyAddressSelected(val);
                        fieldProps.onChange(val.place_name);
                      }}
                      ref={ref}
                    >
                      <Combobox.Input
                        className={`w-full shadow-sm rounded-md px-3 py-2 ${
                          errors.companyAddress
                            ? "border-northeastern-red"
                            : "border-black"
                        }`}
                        displayValue={(feat: CarpoolAddress) =>
                          feat.place_name ? feat.place_name : ""
                        }
                        type="text"
                        onChange={(e) => {
                          if (e.target.value === "") {
                            setCompanyAddressSelected({
                              place_name: "",
                              center: [0, 0],
                            });
                            fieldProps.onChange("");
                          } else {
                            updateCompanyAddress(e.target.value);
                          }
                        }}
                      />
                      <Transition
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                      >
                        <Combobox.Options className="w-full rounded-md bg-white text-base shadow-lg focus:outline-none ">
                          {companyAddressSuggestions.length === 0 ? (
                            <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                              Nothing found.
                            </div>
                          ) : (
                            companyAddressSuggestions.map((feat) => (
                              <Combobox.Option
                                key={feat.id}
                                className={({ active }) =>
                                  `w-full relative cursor-default select-none p-3 ${
                                    active
                                      ? "bg-blue-400 text-white"
                                      : "text-gray-900"
                                  }`
                                }
                                value={feat}
                              >
                                {feat.place_name}
                              </Combobox.Option>
                            ))
                          )}
                        </Combobox.Options>
                      </Transition>
                    </Combobox>
                  )}
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
                    <TextField
                      inputClassName="py-[14px]"
                      className="self-end w-36"
                      label="Seat Availability"
                      id="seatAvail"
                      error={errors.seatAvail}
                      type="number"
                      {...register("seatAvail", { valueAsNumber: true })}
                    />
                  )}
                </div>
              </BottomProfileSection>
            </ProfileColumn>

            <ProfileColumn>
              <CommutingScheduleSection>
                <ProfileHeader>Commuting Schedule</ProfileHeader>
                {/* Days working field  */}
                <div className="my-4">
                  <div className="border-l-2 border-l-black">
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
                              padding: 0,
                            }}
                            checked={value}
                            onChange={onChange}
                            checkedIcon={<DayBox day={day} isSelected={true} />}
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
                <div className="flex w-full gap-6 pb-4">
                  <div>
                    <EntryLabel
                      required={true}
                      error={errors.startTime}
                      label="Start Time"
                    />
                    <ControlledTimePicker
                      control={control}
                      label="Start time"
                      name={"startTime"}
                      placeholder={"Start time"}
                    />
                  </div>
                  <div>
                    <EntryLabel
                      required={true}
                      error={errors.endTime}
                      label="End Time"
                    />
                    <ControlledTimePicker
                      control={control}
                      label="End time"
                      name={"endTime"}
                      placeholder={"End time"}
                    />
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <EntryRow>
                    <Checkbox
                      {...register("timeDiffers")}
                      sx={{
                        padding: 0,
                        input: {
                          width: 30,
                          height: 30,
                        },
                      }}
                    />
                    <LightEntryLabel>
                      My start/end time is different each day
                    </LightEntryLabel>
                    <Tooltip
                      title="If you don't have set times, communicate that on your own with potential riders/drivers."
                      placement="right"
                    >
                      <Icon>
                        <MdHelp fill="#C8102E" />
                      </Icon>
                    </Tooltip>
                  </EntryRow>
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
                      {...register("preferredName")}
                    />
                  </div>

                  {/* Pronouns field  */}
                  <div className="w-2/6">
                    <LightEntryLabel error={!!errors.pronouns}>
                      Pronouns
                    </LightEntryLabel>
                    <TextField
                      id="pronouns"
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
                    label="Intro"
                  />
                  <textarea
                    className={`resize-none form-input w-full shadow-sm rounded-md px-3 py-2`}
                    maxLength={300}
                    {...register("bio")}
                  />
                  <Note>
                    Note: This intro will be shared with people you choose to
                    connect with.
                  </Note>
                </div>
              </PersonalInfoSection>
            </ProfileColumn>
          </div>
          <CompleteProfileButton type="submit">
            Complete Profile
          </CompleteProfileButton>
        </ProfileContainer>
      </div>
    </>
  );
};

export default ProtectedPage(Profile);
