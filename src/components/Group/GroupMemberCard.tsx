import { Role } from "@prisma/client";
import { PublicUser } from "../../utils/types";
import { useContext } from "react";
import { UserContext } from "../../utils/userContext";
import Spinner from "../Spinner";
import _ from "lodash";
import { trpc } from "../../utils/trpc";
import { toast } from "react-toastify";
import { TRPCClientError } from "@trpc/client";
import { useToasts } from "react-toast-notifications";

interface GroupMembersProps {
  users: PublicUser[];
  onClose: () => void;
}
export const GroupMembers = (props: GroupMembersProps) => {
  const curUser = useContext(UserContext);
  const driver = props.users.find((user) => user.role === Role.DRIVER);
  const riders = props.users.filter(
    (user) => user.id !== driver?.id && user.id !== curUser?.id,
  );
  const utils = trpc.useContext();
  const { addToast } = useToasts();

  const { mutate: deleteGroup } = trpc.user.groups.delete.useMutation({
    onError: (error: any) => {
      toast.error(`Something went wrong: ${error.message}`);
    },
    onSuccess() {
      utils.user.me.invalidate();
      props.onClose();
      addToast("Group has been successfully deleted");
    },
  });

  const { mutate: editGroup } = trpc.user.groups.edit.useMutation({
    onError: (error: any) => {
      toast.error(`Something went wrong: ${error.message}`);
    },
    onSuccess() {
      if (riders.length <= 1) {
        props.onClose();
      } else {
        utils.user.groups.me.invalidate();
      }
      utils.user.me.invalidate();
      addToast("Removed from group");
    },
  });

  if (!driver || !curUser) {
    return <Spinner />;
  }

  const handleDelete = () => {
    if (driver.carpoolId) {
      deleteGroup({ groupId: driver.carpoolId });
    } else {
      throw new TRPCClientError("Driver id does not exist");
    }
  };

  const handleEdit = (id: string) => {
    if (driver.carpoolId) {
      editGroup({
        driverId: driver.id,
        riderId: id,
        add: false,
        groupId: driver.carpoolId,
      });
    } else {
      throw new TRPCClientError("Driver id does not exist");
    }
  };

  const DriverGroupMembers = () => {
    return (
      <>
        <GroupMemberCard
          user={driver}
          buttonText="Delete Group"
          buttonFunc={handleDelete}
        />
        {riders.map((rider) => (
          <GroupMemberCard
            key={rider.id}
            user={rider}
            buttonText="Remove"
            buttonFunc={handleEdit}
          />
        ))}
      </>
    );
  };

  const RiderGroupMembers = () => {
    return (
      <>
        <GroupMemberCard user={driver} />
        <GroupMemberCard
          user={curUser}
          buttonText="Leave Group"
          buttonFunc={handleEdit}
        />
        {riders.map((rider) => (
          <GroupMemberCard key={rider.id} user={rider} />
        ))}
      </>
    );
  };

  if (curUser.role === Role.DRIVER) {
    return <DriverGroupMembers />;
  } else {
    return <RiderGroupMembers />;
  }
};

interface GroupMemberCardProps {
  user: PublicUser;
  buttonText?: string;
  buttonFunc?: (id: string) => void;
}
export const GroupMemberCard = (props: GroupMemberCardProps) => {
  return (
    <div className="flex items-center py-3">
      <div className="mx-2 flex-1">
        <div className="flex flex-row">
          <h1 className="text-xl font-bold">{props.user.preferredName}</h1>
          <p className="text-xl">
            {"\u00A0| " +
              (props.user.role === Role.DRIVER ? "Driver" : "Rider")}
          </p>
        </div>
        <p className="text-sm">{props.user.email}</p>
        <div className="flex-grow"></div>
      </div>
      {props.buttonText && props.buttonFunc && (
        <button
          className="mx-2 h-full w-[150px] rounded-md bg-red-700 text-white"
          onClick={() => props.buttonFunc && props.buttonFunc(props.user.id)}
        >
          {props.buttonText}
        </button>
      )}
    </div>
  );
};
