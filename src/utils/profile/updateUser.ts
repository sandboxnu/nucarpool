import { toast } from "react-toastify";
import { NextRouter } from "next/router";
import { trpc } from "../trpc";
import { UserInfo } from "../types";
export const updateUser = async ({
  userInfo,
  sessionName,
  mutation,
}: {
  userInfo: UserInfo & {
    startStreet: string;
    startCity: string;
    startState: string;
    companyStreet: string;
    companyCity: string;
    companyState: string;
  };
  sessionName: string;
  mutation: ReturnType<typeof useEditUserMutation>;
}) => {
  const daysWorkingParsed: string = userInfo.daysWorking
    .map((val: boolean) => {
      if (val) {
        return "1";
      } else {
        return "0";
      }
    })
    .join(",");
  await mutation.mutateAsync({
    role: userInfo.role,
    status: userInfo.status,
    seatAvail: userInfo.seatAvail,
    companyName: userInfo.companyName,
    companyAddress: userInfo.companyAddress,
    companyCoordLng: userInfo.companyCoordLng,
    companyCoordLat: userInfo.companyCoordLat,
    startAddress: userInfo.startAddress,
    startCoordLng: userInfo.startCoordLng,
    startCoordLat: userInfo.startCoordLat,
    isOnboarded: true,
    preferredName: userInfo.preferredName || sessionName,
    pronouns: userInfo.pronouns,
    daysWorking: daysWorkingParsed,
    startTime: userInfo.startTime?.toISOString(),
    endTime: userInfo.endTime?.toISOString(),
    bio: userInfo.bio,
    coopStartDate: userInfo.coopStartDate!,
    coopEndDate: userInfo.coopEndDate!,
    licenseSigned: true,
    startStreet: userInfo.startStreet,
    startCity: userInfo.startCity,
    startState: userInfo.startState,
    companyStreet: userInfo.companyStreet,
    companyCity: userInfo.companyCity,
    companyState: userInfo.companyState,
  });
};
export const useEditUserMutation = (
  router: NextRouter,
  onComplete: () => void,
  pushMap: boolean = true,
) => {
  const utils = trpc.useContext();

  return trpc.user.edit.useMutation({
    onSuccess: async () => {
      await utils.user.me.refetch();
      await utils.user.recommendations.me.invalidate();
      await utils.mapbox.geoJsonUserList.invalidate();
      if (pushMap) {
        router.push("/").then(() => {
          onComplete();
        });
      } else {
        onComplete();
      }
    },
    onError: (error) => {
      toast.error(`Something went wrong: ${error.message}`);
      onComplete();
    },
  });
};
