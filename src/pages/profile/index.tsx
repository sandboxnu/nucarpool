import React, { useEffect, useState } from "react";
import { FieldErrors, SubmitHandler, useForm } from "react-hook-form";
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
import UnsavedModal from "../../components/Profile/UnsavedModal";
import useIsMobile from "../../utils/useIsMobile";

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
  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { uploadFile } = useUploadFile(selectedFile);
  const { data: session } = useSession();
  const { data: user } = trpc.user.me.useQuery(undefined, {
    refetchOnMount: true,
  });
  const editUserMutation = useEditUserMutation(
    router,
    () => setIsLoading(false),
    false,
  );
  const startAddressHook = useAddressSelection();
  const companyAddressHook = useAddressSelection();

  const { setSelectedAddress: setStartAddressSelected } = startAddressHook;
  const { setSelectedAddress: setCompanyAddressSelected } = companyAddressHook;

  const isMobile = useIsMobile();

  useEffect(() => {
    if (user?.startAddress && user.startAddress !== "") {
      setStartAddressSelected({
        place_name: user.startAddress,
        center: [user.startCoordLng, user.startCoordLat],
        street: user.startStreet || "",
        city: user.startCity || "",
        state: user.startState || "",
      });
    }
    if (user?.companyAddress && user.companyAddress !== "") {
      setCompanyAddressSelected({
        place_name: user.companyAddress,
        center: [user.companyCoordLng, user.companyCoordLat],
        street: user.companyStreet || "",
        city: user.companyCity || "",
        state: user.companyState || "",
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
    if (user) {
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
      // remove setInitialLoad(false) so it reloads every time
    }
  }, [reset, user]);
  const role = watch("role");

  useEffect(() => {
    const seatAvail = watch("seatAvail");
    if (role === Role.DRIVER && (seatAvail ?? 0) <= 0) {
      setValue("seatAvail", 1);
    } else if (role !== Role.DRIVER) {
      setValue("seatAvail", 0);
    }
  }, [setValue, watch, role]);
  const checkForChanges = async () => {
    const formValues = watch();

    const hasChanges =
      formValues.role !== user?.role ||
      formValues.seatAvail !== user?.seatAvail ||
      formValues.status !== user?.status ||
      formValues.companyName !== user?.companyName ||
      formValues.companyAddress !== user?.companyAddress ||
      formValues.startAddress !== user?.startAddress ||
      formValues.preferredName !== user?.preferredName ||
      formValues.pronouns !== user?.pronouns ||
      (formValues.daysWorking ?? []).some(
        (day, index) => day !== (user?.daysWorking.split(",")[index] === "1"),
      ) ||
      formValues.startTime?.getTime() !== user?.startTime?.getTime() ||
      formValues.endTime?.getTime() !== user?.endTime?.getTime() ||
      formValues.coopStartDate?.getDate() !== user?.coopStartDate?.getDate() ||
      formValues.coopEndDate?.getDate() !== user?.coopEndDate?.getDate() ||
      formValues.bio !== user?.bio;

    if (hasChanges) {
      setShowModal(true);
    } else {
      setIsLoading(true);
      await router.push("/");
      setIsLoading(false);
    }
  };
  const onContinue = async () => {
    setIsLoading(true);
    await router.push("/");
    setIsLoading(false);
    setShowModal(false);
  };

  const onSubmit = async (values: OnboardingFormInputs) => {
    setIsLoading(true);
    const userInfo = {
      ...values,
      companyCoordLng: companyAddressHook.selectedAddress.center[0],
      companyCoordLat: companyAddressHook.selectedAddress.center[1],
      startCoordLng: startAddressHook.selectedAddress.center[0],
      startCoordLat: startAddressHook.selectedAddress.center[1],
      seatAvail: values.role === "RIDER" ? 0 : (values.seatAvail ?? 0),
      startStreet: startAddressHook.selectedAddress.street || user?.startStreet || "",
      startCity: startAddressHook.selectedAddress.city || user?.startCity || "",
      startState: startAddressHook.selectedAddress.state || user?.startState || "",
      companyStreet: companyAddressHook.selectedAddress.street || user?.companyStreet || "",
      companyCity: companyAddressHook.selectedAddress.city || user?.companyCity || "",
      companyState: companyAddressHook.selectedAddress.state || user?.companyState || "",
      companyName: values.companyName ?? "",
      profilePicture: values.profilePicture ?? "",
      companyAddress: values.companyAddress ?? "",
      startAddress: values.startAddress ?? "",
      preferredName: values.preferredName ?? "",
      pronouns: values.pronouns ?? "",
      bio: values.bio ?? "",
      daysWorking: values.daysWorking ?? [],
      startTime: values.startTime ?? null,
      endTime: values.endTime ?? null,
      coopStartDate: values.coopStartDate ?? null,
      coopEndDate: values.coopEndDate ?? null,
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
  const onSubmitWithContinue: SubmitHandler<OnboardingFormInputs> = async (
    values,
  ) => {
    await onSubmit(values);
    await onContinue();
  };
  const handleSaveChanges = async () => {
    setShowModal(false);
    await handleSubmit(onSubmitWithContinue, onError)();
  };
  const onError = (errors: FieldErrors<OnboardingFormInputs>) => {
    const firstErrorKey = Object.keys(errors)[0];
    if (firstErrorKey) {
      if (
        ["preferredName", "pronouns", "role", "bio", "seatAvail"].includes(
          firstErrorKey,
        )
      ) {
        setOption("user");
      } else if (
        [
          "startAddress",
          "companyAddress",
          "companyName",
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
      <div className="fixed inset-0 z-50  flex items-center justify-center bg-white ">
        <Spinner />
      </div>
    );
  }
  return (
    <div className="relative h-screen w-screen select-none ">
      {showModal && (
        <UnsavedModal
          onClose={() => setShowModal(false)}
          onContinue={onContinue}
          onSave={handleSaveChanges}
        />
      )}

      <Header profile={true} checkChanges={checkForChanges} />

      {isMobile && (
        <div className="w-full border-b-2 border-busy-red bg-stone-100 z-10">
          <ProfileSidebar option={option} setOption={setOption} />
        </div>
      )}

      {isMobile ? (
        <div className="absolute top-[6rem] bottom-16 left-0 right-0 overflow-y-auto">
          <div className="px-8 pt-6 pb-24">
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
      ) : (
        <div className="relative h-[91.5%] w-full grid grid-cols-[250px_repeat(2,1fr)] overflow-hidden">
          <div className="sticky top-0 col-start-1 col-end-2 h-full w-[250px] border-r-4 border-busy-red bg-stone-100 lg:w-[350px]">
            <ProfileSidebar option={option} setOption={setOption} />
          </div>

          <div className="col-start-2 col-end-4 flex h-full shrink items-start justify-center overflow-y-auto overflow-x-hidden">
            <div className="mt-10 w-full max-w-2xl px-8">
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
      )}
    </div>
  );
};
export default Index;
