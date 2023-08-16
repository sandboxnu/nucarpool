import { Role } from "@prisma/client";
import { PublicUser } from "../../utils/types";
import { useContext } from "react";
import { UserContext } from "../../utils/userContext";

interface GroupMembersProps {
  users: PublicUser[];
}
export const GroupMembers = (props: GroupMembersProps) => {
  const curUser = useContext(UserContext);
  return (
    <>
      {props.users.map((user) => (
        <GroupMemberCard user={user} />
      ))}
    </>
  );
  // if (curUser?.role === Role.DRIVER) {
  //   return <DriverGroupMembers users={props.users}/>
  // }
  // else {
  //   return <RiderGroupMembers users={props.users}/>
  // }
};

const DriverGroupMembers = ({ users }: { users: PublicUser[] }) => {
  return <></>;
};

const RiderGroupMembers = ({ users }: { users: PublicUser[] }) => {
  return <></>;
};

interface GroupMemberCardProps {
  user: PublicUser;
  // buttonText: string
  // buttonFunc: () => void
}
export const GroupMemberCard = (props: GroupMemberCardProps) => {
  return (
    <div className="m-2 flex items-center">
      <div className="mx-2 flex-1 rounded-md rounded-md border border-gray-300 px-1 px-2 py-1">
        <div className="flex flex-row">
          <h1 className="text-xl font-bold">{props.user.preferredName}</h1>
          <p className="px-2 text-xl">
            {"| " + (props.user.role === Role.DRIVER ? "Driver" : "Rider")}
          </p>
        </div>
        <p className="text-sm">{props.user.email}</p>
        <div className="flex-grow"></div>
      </div>
      <button className="mx-3 h-full w-[150px] rounded-md bg-red-700 px-4 py-2 text-white">
        Remove
      </button>
    </div>
  );
};
