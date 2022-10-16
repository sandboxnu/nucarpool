import { Combobox, Transition } from "@headlessui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Role, Status } from "@prisma/client";
import { Feature } from "geojson";
import { debounce } from "lodash";
import { GetServerSidePropsContext, NextPage } from "next";
import { unstable_getServerSession as getServerSession } from "next-auth";
import Head from "next/head";
import { useRouter } from "next/router";
import { Fragment, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";
import Header from "../components/Header";
import { TextField } from "../components/TextField";
import { trpc } from "../utils/trpc";
import { authOptions } from "./api/auth/[...nextauth]";
import { User } from "../utils/types";
import Spinner from "../components/Spinner";
import Radio from "../components/Radio";
import useSearch from "../utils/search";

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (session?.user) {
    if (!session.user.isOnboarded) {
      return {
        redirect: {
          destination: "/onboard",
          permanent: false,
        },
      };
    }
  } else {
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

type SettingsFormInputs = {
  role: Role;
  seatAvail: number;
  status: Status;
  companyName: string;
  companyAddress: string;
  startLocation: string;
};

export const onboardSchema = z.object({
  role: z.nativeEnum(Role),
  seatAvail: z
    .number({ invalid_type_error: "Cannot be empty" })
    .int("Must be an integer")
    .nonnegative("Must be greater or equal to 0"),
  status: z.nativeEnum(Status),
  companyName: z.string().min(1, "Cannot be empty"),
  companyAddress: z.string().min(1, "Cannot be empty"),
  startLocation: z.string().min(1, "Cannot be empty"),
});

function UserEditForm({ user }: { user: User }) {
  const router = useRouter();
  const [suggestions, setSuggestions] = useState<Feature[]>([]);
  const [selected, setSelected] = useState({
    place_name: user.companyAddress,
  });
  const [companyAddress, setCompanyAddress] = useState("")
  const updateCompanyAddress = useMemo(() => debounce(setCompanyAddress, 1000), [])
  const [startingAddress, setStartingAddress] = useState("")
  const updateStartingAddress = useMemo(() => debounce(setStartingAddress, 1000), [])

  const [startLocationsuggestions, setStartLocationSuggestions] = useState<
    Feature[]
  >([]);
  const [startLocationSelected, setStartLocationSelected] = useState({
    place_name: user.startLocation,
  });

  const editUserMutation = trpc.useMutation("user.edit", {
    onSuccess: () => {
      toast.success("Successfully update profile info.");
    },
    onError: (error) => {
      toast.error(`Something went wrong: ${error.message}`);
    },
  });

  const {
    register,
    formState: { errors, isDirty },
    watch,
    handleSubmit,
  } = useForm<SettingsFormInputs>({
    mode: "onBlur",
    defaultValues: {
      role: user.role,
      seatAvail: user.seatAvail,
      status: user.status,
      companyName: user.companyName,
      companyAddress: user.companyAddress,
      startLocation: user.startLocation,
    },
    resolver: zodResolver(onboardSchema),
  });

  useSearch({
    value: companyAddress,
    type: "address%2Cpostcode", 
    setFunc: setSuggestions,
  });

  useSearch({
    value: startingAddress,
    type: "neighborhood%2Cplace", 
    setFunc: setStartLocationSuggestions,
  });

  const onSubmit = async (values: SettingsFormInputs) => {
    const coord: number[] = (selected as any).center;
    const userInfo = {
      ...values,
      companyCoordLng: coord ? coord[0] : user.companyCoordLng,
      companyCoordLat: coord ? coord[1] : user.companyCoordLat,
      seatAvail: values.role === Role.RIDER ? 0 : values.seatAvail,
    };

    editUserMutation.mutate({
      role: userInfo.role,
      status: userInfo.status,
      seatAvail: userInfo.seatAvail,
      companyName: userInfo.companyName,
      companyAddress: userInfo.companyAddress,
      companyCoordLng: userInfo.companyCoordLng!,
      companyCoordLat: userInfo.companyCoordLat!,
      startLocation: userInfo.startLocation,
      isOnboarded: true,
    });
  };

  return (
    <>
      <Head>Settings</Head>
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="rounded-2xl bg-white flex flex-col justify-center items-center p-6 m-4 space-y-4 drop-shadow-lg">
          <Header />
          <h1 className="font-bold text-2xl mb-4">Settings</h1>
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

            <div className="flex flex-col space-y-2">
              <h1 className="font-medium text-sm">Status</h1>
              <div className="flex space-x-4">
                <Radio
                  label="Active"
                  id="active"
                  error={errors.status}
                  value={Status.ACTIVE}
                  {...register("status")}
                />
                <Radio
                  label="Inactive"
                  id="inactive"
                  error={errors.status}
                  value={Status.INACTIVE}
                  {...register("status")}
                />
              </div>
            </div>

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
              <Combobox value={selected} onChange={setSelected}>
                <Combobox.Input
                  className={`w-full shadow-sm rounded-md px-3 py-2 ${
                    errors.companyAddress ? "border-red-500" : "border-gray-300"
                  }`}
                  displayValue={(feat: any) =>
                    feat.place_name ? feat.place_name : ""
                  }
                  type="text"
                  {...register("companyAddress")}
                  onChange={(e) => updateCompanyAddress(e.target.value)}
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
              <Combobox
                value={startLocationSelected}
                onChange={setStartLocationSelected}
              >
                <Combobox.Input
                  className={`w-full shadow-sm rounded-md px-3 py-2 ${
                    errors.startLocation ? "border-red-500" : "border-gray-300"
                  }`}
                  displayValue={(feat: any) =>
                    feat.place_name ? feat.place_name : ""
                  }
                  type="text"
                  {...register("startLocation")}
                  onChange={(e) => updateStartingAddress(e.target.value)}
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
              {errors.startLocation && (
                <p className="text-red-500 text-sm mt-2">
                  {errors?.startLocation?.message}
                </p>
              )}
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => router.push("/")}
                className="rounded-md text-center text-white bg-blue-500 border border-gray-300 px-3 py-2 hover:bg-blue-800"
              >
                Return to Home
              </button>
              <button
                type="submit"
                className=" bg-northeastern-red hover:bg-red-800 rounded-md text-white px-3 py-2 shadow"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

const Settings: NextPage = () => {
  const { data: user, isLoading: isLoadingUser } = trpc.useQuery(["user.me"]);

  return (
    <>
      <Head>
        <title>Settings</title>
      </Head>

      {!user || isLoadingUser ? <Spinner /> : <UserEditForm user={user} />}
    </>
  );
};

export default Settings;
