import { Combobox, Transition } from "@headlessui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Feature } from "geojson";
import _, { debounce } from "lodash";
import { GetServerSidePropsContext, NextPage } from "next";
import { useRouter } from "next/router";
import {
  Fragment,
  JSXElementConstructor,
  ReactElement,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Controller, FieldError, NestedValue, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import Header from "../components/Header";
import { unstable_getServerSession as getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]";
import Head from "next/head";
import { array, z } from "zod";
import { trpc } from "../utils/trpc";
import { Role, Status } from "@prisma/client";
import { TextField } from "../components/TextField";
import Radio from "../components/Radio";
import useSearch from "../utils/search";
import ProtectedPage from "../utils/auth";
import ControlledTextbox from "../components/ControlledTextbox";
import ControlledCheckbox from "../components/ControlledTextbox";
import Checkbox from "@mui/material/Checkbox";
import { time } from "console";
import DayBox from "../components/DayBox";
import { Tooltip, Icon, TextFieldProps } from "@mui/material";
import { MdHelp } from "react-icons/md";
import StaticTimePicker from "@mui/x-date-pickers/StaticTimePicker";
import { TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TextField as MUITextField } from "@mui/material";
import dayjs, { Dayjs } from "dayjs";

// Inputs to the onboarding form.
type OnboardingFormInputs = {
  role: Role;
  seatAvail: number;
  companyName: string;
  companyAddress: string;
  startLocation: string;
  preferredName: string;
  pronouns: string;
  daysWorking: boolean[];
  startTime?: Date;
  endTime?: string;
  timeDiffers: boolean;
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
    startLocation: z.string().min(1, "Cannot be empty"),
    preferredName: z.string(),
    pronouns: z.string(),
    daysWorking: z
      .array(z.boolean())
      .refine((a) => a.some((b) => b), { message: "Select at least one day" }), // Make this regex.
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
    setValue,
    clearErrors,
    control,
  } = useForm<OnboardingFormInputs>({
    mode: "onSubmit",
    defaultValues: {
      role: Role.RIDER,
      seatAvail: 0,
      companyName: "",
      companyAddress: "",
      startLocation: "",
      preferredName: "",
      pronouns: "",
      daysWorking: [false, false, false, false, false, false, false],
      startTime: undefined,
      endTime: "",
      timeDiffers: false,
    },
    resolver: zodResolver(onboardSchema),
  });

  const [suggestions, setSuggestions] = useState<Feature[]>([]);
  const [selected, setSelected] = useState({ place_name: "" });
  const [startLocationsuggestions, setStartLocationSuggestions] = useState<
    Feature[]
  >([]);
  const [startLocationSelected, setStartLocationSelected] = useState({
    place_name: "",
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

  useSearch({
    value: companyAddress,
    type: "address%2Cpostcode",
    setFunc: setSuggestions,
  });

  useSearch({
    value: startingAddress,
    type: "address%2Cpostcode",
    setFunc: setStartLocationSuggestions,
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
    const coord: number[] = (selected as any).center;
    const startCoord: number[] = (startLocationSelected as any).center;
    const userInfo = {
      ...values,
      companyCoordLng: coord[0],
      companyCoordLat: coord[1],
      startCoordLat: startCoord[0],
      startCoordLng: startCoord[1],
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
      startCoordLng: userInfo.startCoordLng!,
      startCoordLat: userInfo.startCoordLat!,
      isOnboarded: true,
      preferredName: userInfo.preferredName,
      pronouns: userInfo.pronouns,
      daysWorking: daysWorkingParsed,
      startTime: userInfo.startTime?.toISOString(),
      endTime: userInfo.endTime,
    });
  };

  return (
    <>
      <Head>
        <title>Profile</title>
      </Head>

      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="rounded-2xl bg-white flex flex-col justify-center items-center p-6 m-4 space-y-4 drop-shadow-lg">
          <Header />
          <h1 className="font-bold text-2xl mb-4">Profile</h1>
          <form
            className="w-full flex flex-col space-y-4"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="flex flex-col space-y-2">
              <h1 className="font-medium text-sm">Role</h1>
              <div className="flex space-x-4">
                <Radio
                  label="Rider"
                  id="rider"
                  error={errors.role}
                  value={Role.RIDER}
                  {...register("role")}
                />
                <Radio
                  label="Driver"
                  id="driver"
                  error={errors.role}
                  value={Role.DRIVER}
                  {...register("role")}
                />
              </div>
            </div>

            {watch("role") == Role.DRIVER && (
              <TextField
                label="Seat Availability"
                id="seatAvail"
                error={errors.seatAvail}
                type="number"
                {...register("seatAvail", { valueAsNumber: true })}
              />
            )}

            <TextField
              label="Company Name"
              id="companyName"
              error={errors.companyName}
              type="text"
              {...register("companyName")}
            />

            {/* Company Address field  */}

            <div className="flex flex-col space-y-2">
              <label htmlFor="companyAddress" className="font-medium text-sm">
                Company Address
              </label>
              <p className="font-light text-xs text-gray-500">
                Note: Select the autocomplete results, even if you typed the
                address out
              </p>
              <Controller
                name="companyAddress"
                control={control}
                render={({ field: { ref, ...fieldProps } }) => (
                  <Combobox
                    as="div"
                    value={selected}
                    onChange={(val) => {
                      setSelected(val);
                      fieldProps.onChange(val.place_name);
                    }}
                    ref={ref}
                  >
                    <Combobox.Input
                      className={`w-full shadow-sm rounded-md px-3 py-2 ${
                        errors.companyAddress
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      displayValue={(feat: any) =>
                        feat.place_name ? feat.place_name : ""
                      }
                      type="text"
                      onChange={(e) => {
                        if (e.target.value === "") {
                          setSelected({ place_name: "" });
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
                        {suggestions.length === 0 ? (
                          <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                            Nothing found.
                          </div>
                        ) : (
                          suggestions.map((feat: any) => (
                            <Combobox.Option
                              key={feat.id}
                              className={({ active }) =>
                                `max-w-fit relative cursor-default select-none p-3 ${
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
                <p className="text-red-500 text-sm mt-2">
                  {errors?.companyAddress?.message}
                </p>
              )}
            </div>

            {/* Starting Location field  */}

            <div className="flex flex-col space-y-2">
              <label htmlFor="startlocation" className="font-medium text-sm">
                Starting Location
              </label>
              <p className="font-light text-xs text-gray-500">
                Note: Enter the neighborhood that you want to go from, and
                select the autocomplete results, even if you typed the address
                out
              </p>
              <Controller
                name="startLocation"
                control={control}
                render={({ field: { ref, ...fieldProps } }) => (
                  <Combobox
                    as="div"
                    value={startLocationSelected}
                    onChange={(val) => {
                      setStartLocationSelected(val);
                      fieldProps.onChange(val.place_name);
                    }}
                    ref={ref}
                  >
                    <Combobox.Input
                      className={`w-full shadow-sm rounded-md px-3 py-2 ${
                        errors.startLocation
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      displayValue={(feat: any) =>
                        feat.place_name ? feat.place_name : ""
                      }
                      type="text"
                      onChange={(e) => {
                        if (e.target.value === "") {
                          setStartLocationSelected({ place_name: "" });
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
                        {startLocationsuggestions.length === 0 ? (
                          <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                            Nothing found.
                          </div>
                        ) : (
                          startLocationsuggestions.map((feat: any) => (
                            <Combobox.Option
                              key={feat.id}
                              className={({ active }) =>
                                `max-w-fit relative cursor-default select-none p-3 ${
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
              {errors.startLocation && (
                <p className="text-red-500 text-sm mt-2">
                  {errors?.startLocation?.message}
                </p>
              )}
            </div>

            {/* Preferred Name field  */}
            <TextField
              label="Preferred Name"
              id="preferredName"
              error={errors.preferredName}
              type="text"
              {...register("preferredName")}
            />

            {/* Pronouns field  */}
            <TextField
              label="Pronouns"
              id="pronouns"
              error={errors.pronouns}
              type="text"
              {...register("pronouns")}
            />

            {/* Days working field  */}
            <div>
              <h1 className="font-medium text-sm">Commuting Schedule</h1>
              {daysOfWeek.map((day, index) => (
                <Checkbox
                  key={day + index.toString()}
                  sx={{
                    input: { width: 1, height: 1 },
                    padding: 0,
                  }}
                  {...register(`daysWorking.${index}`)}
                  checkedIcon={<DayBox day={day} isSelected={true} />}
                  icon={<DayBox day={day} isSelected={false} />}
                  defaultChecked={false}
                />
              ))}

              {errors.daysWorking && (
                <p className="text-red-500 text-sm mt-2">
                  {(errors.daysWorking as unknown as FieldError).message}
                </p>
              )}
            </div>

            {/* Start/End Time Fields  */}

            <div className="flex flex-col space-y-2">
              <h1 className="font-medium text-sm">
                My start/end time is different each day
              </h1>
              <div className="flex space-x-4">
                <Checkbox {...register("timeDiffers")} />
                <Tooltip
                  title="If you don't have set times, communicate that on your own with potential riders/drivers."
                  placement="right"
                >
                  <Icon>
                    <MdHelp />
                  </Icon>
                </Tooltip>
              </div>
            </div>

            {!watch("timeDiffers") && (
              <div>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <Controller
                    name="startTime"
                    control={control}
                    render={({ field: { ref, ...fieldProps } }) => (
                      <TimePicker
                        inputRef={ref}
                        {...fieldProps}
                        value={
                          fieldProps.value ? dayjs(fieldProps.value) : null
                        }
                        onChange={(date) => {
                          fieldProps.onChange(date?.toDate());
                        }}
                        label="Start Time"
                        renderInput={function (props: TextFieldProps) {
                          return (
                            <MUITextField
                              {...props}
                              helperText={errors.startTime?.message}
                              error={!!errors.startTime}
                            />
                          );
                        }}
                        disableOpenPicker
                      />
                    )}
                  />
                </LocalizationProvider>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <Controller
                    name="endTime"
                    control={control}
                    render={({ field: { ref, ...fieldProps } }) => (
                      <TimePicker
                        inputRef={ref}
                        {...fieldProps}
                        value={
                          fieldProps.value ? dayjs(fieldProps.value) : null
                        }
                        onChange={(date) => {
                          fieldProps.onChange(date?.toDate());
                        }}
                        label="End Time"
                        renderInput={function (props: TextFieldProps) {
                          return (
                            <MUITextField
                              {...props}
                              helperText={errors.endTime?.message}
                              error={!!errors.endTime}
                            />
                          );
                        }}
                        disableOpenPicker
                      />
                    )}
                  />
                </LocalizationProvider>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-northeastern-red hover:bg-red-800 rounded-md text-white px-3 py-2 shadow"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ProtectedPage(Profile);
