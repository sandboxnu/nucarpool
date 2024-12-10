import React, { useEffect, useState } from "react";
import { FieldErrors, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GetServerSidePropsContext, NextPage } from "next";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { getSession, useSession } from "next-auth/react";
import { trpc } from "../../utils/trpc";
import { OnboardingFormInputs } from "../../utils/types";
import {
  onboardSchema,
  profileDefaultValues,
} from "../../utils/profile/zodSchema";

import Spinner from "../../components/Spinner";

import { Role } from "@prisma/client";
import { trackProfileCompletion } from "../../utils/mixpanel";
import { useUploadFile } from "../../utils/profile/useUploadFile";
import { useAddressSelection } from "../../utils/useAddressSelection";
import {
  updateUser,
  useEditUserMutation,
} from "../../utils/profile/updateUser";

import ProfileSidebar from "../../components/Profile/ProfileSidebar";
import UserSection from "../../components/Profile/UserSection";
import Header from "../../components/Header";
import CarpoolSection from "../../components/Profile/CarpoolSection";
import AccountSection from "../../components/Profile/AccountSection";

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
  const [option, setOption] = useState<"user" | "carpool" | "account">("user");
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { uploadFile } = useUploadFile(selectedFile);
  const { data: session } = useSession();
  const { data: user } = trpc.user.me.useQuery(undefined, {
    refetchOnMount: true,
  });
  const editUserMutation = useEditUserMutation(
    router,
    () => setIsLoading(false),
    false
  );
  const startAddressHook = useAddressSelection();
  const companyAddressHook = useAddressSelection();

  const { setSelectedAddress: setStartAddressSelected } = startAddressHook;
  const { setSelectedAddress: setCompanyAddressSelected } = companyAddressHook;

  useEffect(() => {
    if (user?.startAddress && user.startAddress !== "") {
      setStartAddressSelected({
        place_name: user.startAddress,
        center: [user.startCoordLng, user.startCoordLat],
      });
    }
    if (user?.companyAddress && user.companyAddress !== "") {
      setCompanyAddressSelected({
        place_name: user.companyAddress,
        center: [user.companyCoordLng, user.companyCoordLat],
      });
    }
  }, [user, setStartAddressSelected, setCompanyAddressSelected]);

  const {
    register,
    setValue,
    formState: { errors },
    watch,
    handleSubmit,
    reset,
    control,
  } = useForm<OnboardingFormInputs>({
    mode: "onChange",
    defaultValues: profileDefaultValues,
    resolver: zodResolver(onboardSchema),
  });

  useEffect(() => {
    if (initialLoad && user) {
      reset({
        role: user.role,
        seatAvail: user.seatAvail,
        status: user.status,
        companyName: user.companyName,
        companyAddress: user.companyAddress,
        startAddress: user.startAddress,
        preferredName: user.preferredName,
        pronouns: user.pronouns,
        daysWorking: user.daysWorking
          ? user.daysWorking.split(",").map((bit) => bit === "1")
          : profileDefaultValues.daysWorking,
        startTime: user.startTime!,
        endTime: user.endTime!,
        coopStartDate: user.coopStartDate!,
        coopEndDate: user.coopEndDate!,
        bio: user.bio,
      });
      setInitialLoad(false);
    }
  }, [initialLoad, reset, user]);
  const role = watch("role");

  useEffect(() => {
    const seatAvail = watch("seatAvail");
    if (role === Role.DRIVER && seatAvail <= 0) {
      setValue("seatAvail", 1);
    } else if (role !== Role.DRIVER) {
      setValue("seatAvail", 0);
    }
  }, [setValue, watch, role]);

  const onSubmit = async (values: OnboardingFormInputs) => {
    setIsLoading(true);
    const userInfo = {
      ...values,
      companyCoordLng: companyAddressHook.selectedAddress.center[0],
      companyCoordLat: companyAddressHook.selectedAddress.center[1],
      startCoordLng: startAddressHook.selectedAddress.center[0],
      startCoordLat: startAddressHook.selectedAddress.center[1],
      seatAvail: values.role === "RIDER" ? 0 : values.seatAvail,
    };
    if (selectedFile) {
      try {
        await uploadFile();
      } catch (error) {
        console.error("File upload failed:", error);
      }
    }
    const sessionName = session?.user?.name ?? "";
    try {
      await updateUser({
        userInfo,
        sessionName,
        mutation: editUserMutation,
      });
      trackProfileCompletion(userInfo.role, userInfo.status);
      toast.success("User profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update user profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  const onError = (errors: FieldErrors<OnboardingFormInputs>) => {
    const firstErrorKey = Object.keys(errors)[0];

    if (firstErrorKey) {
      if (
        ["preferredName", "pronouns", "role", "bio", "seatAvail"].includes(
          firstErrorKey
        )
      ) {
        setOption("user");
      } else if (
        [
          "startAddress",
          "companyAddress",
          "startTime",
          "endTime",
          "daysWorking",
        ].includes(firstErrorKey)
      ) {
        setOption("carpool");
      } else {
        setOption("account");
      }
    }
    toast.error("One or more fields are invalid, please fix and try again.");
  };

  if (isLoading || !user) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white ">
        <Spinner />
      </div>
    );
  }
  return (
    <div className="relative h-screen w-screen select-none ">
      <div className="fixed left-0 right-0 top-0 h-full w-full  ">
        <Header profile={true} />
      </div>

      <div className="relative top-[8.5%] grid  h-[91.5%] w-full grid-cols-[250px_repeat(2,1fr)] overflow-hidden lg:grid-cols-[350px_repeat(2,1fr)]">
        {/* Sidebar */}
        <div className="sticky  top-0 col-start-1 col-end-2 h-full w-[250px]  border-r-4 border-busy-red bg-stone-100 lg:w-[350px]">
          <ProfileSidebar option={option} setOption={setOption} />
        </div>

        {/* Main Section */}
        <div className="col-start-2 col-end-4 flex h-full shrink items-start justify-center overflow-y-auto overflow-x-hidden ">
          <div className="mt-16 lg:-translate-x-[175px]  ">
            {option === "user" ? (
              <UserSection
                watch={watch}
                onFileSelect={setSelectedFile}
                errors={errors}
                register={register}
                onSubmit={handleSubmit(onSubmit, onError)}
                setValue={setValue}
              />
            ) : option === "carpool" ? (
              <CarpoolSection
                watch={watch}
                onFileSelect={setSelectedFile}
                errors={errors}
                register={register}
                setValue={setValue}
                onSubmit={handleSubmit(onSubmit, onError)}
                startAddressHook={startAddressHook}
                companyAddressHook={companyAddressHook}
                control={control}
              />
            ) : option === "account" ? (
              <AccountSection
                control={control}
                watch={watch}
                onSubmit={handleSubmit(onSubmit, onError)}
                errors={errors}
                setValue={setValue}
              />
            ) : (
              <></>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Index;
