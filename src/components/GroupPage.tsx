import { Dialog } from "@headlessui/react";
import { useContext, useState, useEffect } from "react";
import { GroupMembers } from "./Group/GroupMemberCard";
import { trpc } from "../utils/trpc";
import { UserContext } from "../utils/userContext";
import { Role, User } from "@prisma/client";
import Spinner from "./Spinner";
import { toast } from "react-toastify";
import { PublicUser } from "../utils/types";

interface GroupPageProps {
  onClose: () => void;
  onViewGroupRoute: (driver: PublicUser, riders: PublicUser[]) => void;
}

export const GroupPage = (props: GroupPageProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const curUser = useContext(UserContext);

  const onClose = () => {
    setIsOpen(false);
    props.onClose();
  };

  if (!curUser) {
    return <Spinner />;
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 backdrop-blur-sm" aria-hidden="true">
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="flex h-4/6 w-4/6 flex-col content-center justify-center gap-4 overflow-hidden rounded-md bg-white py-9 shadow-md">
            <Dialog.Title className="text-center text-3xl font-bold">
              Group Page
            </Dialog.Title>
            <GroupBody 
              curUser={curUser} 
              onClose={onClose} 
              onViewGroupRoute={props.onViewGroupRoute}
            />
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
};

const GroupBody = ({
  curUser,
  onClose,
  onViewGroupRoute,
}: {
  curUser: User;
  onClose: () => void;
  onViewGroupRoute: (driver: PublicUser, riders: PublicUser[]) => void;
}) => {
  return !curUser?.carpoolId ? (
    <NoGroupInfo role={curUser.role} onClose={onClose} />
  ) : (
    <GroupInfo curUser={curUser} onClose={onClose} onViewGroupRoute={onViewGroupRoute} />
  );
};

interface NoGroupInfoProps {
  role: Role;
  onClose: () => void;
}

const NoGroupInfo = ({ role }: NoGroupInfoProps) => {
  const utils = trpc.useContext();
  const { data: user } = trpc.user.me.useQuery();
  const [preview, setPreview] = useState("");
  const [groupMessage, setGroupMessage] = useState(user?.groupMessage ?? "");
  const { mutate: updateUserMessage } =
    trpc.user.groups.updateUserMessage.useMutation({
      onSuccess: () => {
        // Invalidate and refetch the user.me query
        utils.user.me.invalidate();
      },
    });

  useEffect(() => {
    if (user?.groupMessage) {
      setGroupMessage(user.groupMessage);
      setPreview(user.groupMessage);
    }
  }, [user]);

  const handleMessageSubmit = async () => {
    if (user?.id && role === "DRIVER") {
      await updateUserMessage({ message: groupMessage });
      setPreview(groupMessage);
    }
  };

  return (
    <div className="flex  flex-col">
      {role === Role.VIEWER ? (
        <div className="flex flex-grow items-center justify-center text-xl font-light">
          You are in Viewer mode, switch to Rider or Driver to join a group
        </div>
      ) : (
        <>
          {role === "DRIVER" && (
            <div className="mx-20 mb-8 flex flex-col py-1">
              <div className="my-1 text-xs italic text-slate-400">
                Below, share any information that you would like riders joining
                you your Carpool to know. You can indicate when you generally
                like to be leaving your place, what your preferred method of
                communication is, what your preference is to split gas and what
                your Carpool vibe will be like.
              </div>
              <div className="flex flex-row gap-2">
                <textarea
                  className="form-input min-h-[50px] flex-grow resize-none rounded-md py-2 shadow-sm"
                  value={groupMessage}
                  onChange={(e) => setGroupMessage(e.target.value)}
                />
                <button
                  className="h-full w-[150px] rounded-md bg-red-700 py-2 text-white"
                  onClick={async () => {
                    await handleMessageSubmit();
                    toast.success("Group message successfully saved!");
                  }}
                >
                  Submit
                </button>
              </div>
              <h3 className="mt-4 flex w-full text-center font-montserrat text-xl font-semibold">
                Preview Message
              </h3>
              <div className="my-1 text-xs italic text-slate-400">
                When you accept a request or a rider joins your group, they will
                see the message displayed here! You can change your group
                message at anytime.
              </div>
              <p className="mt-2 min-h-10 flex-1 justify-center rounded-md border px-3 py-2 text-center text-sm shadow-sm">
                {preview}
              </p>
            </div>
          )}
          <div className="flex flex-grow items-center justify-center text-xl font-light">
            You are not currently part of a carpool group
          </div>
        </>
      )}
    </div>
  );
};

const GroupInfo = ({
  curUser,
  onClose,
  onViewGroupRoute,
}: {
  curUser: User;
  onClose: () => void;
  onViewGroupRoute: (driver: PublicUser, riders: PublicUser[]) => void;
}) => {
  const utils = trpc.useUtils();
  const { data: group } = trpc.user.groups.me.useQuery();
  const users = group?.users ?? [];
  const [groupMessage, setGroupMessage] = useState(group?.message ?? "");

  const driver = users.find(user => user.role === Role.DRIVER);
  const riders = users.filter(user => user.role === Role.RIDER);

  const { mutate: updateMessage } = trpc.user.groups.updateMessage.useMutation({
    onSuccess: () => {
      // Invalidate and refetch the groups.me query
      utils.user.groups.me.invalidate();
    },
  });
  const { mutate: updateUserMessage } =
    trpc.user.groups.updateUserMessage.useMutation({
      onSuccess: () => {
        // Invalidate and refetch the user.me query
        utils.user.me.invalidate();
      },
    });

  useEffect(() => {
    if (group?.message !== undefined) {
      setGroupMessage(group.message);
    }
  }, [group]);

  const handleMessageSubmit = async () => {
    if (group?.id && curUser?.role === "DRIVER") {
      await updateMessage({ groupId: group.id, message: groupMessage });
      await updateUserMessage({ message: groupMessage });
    }
  };

  const handleViewCombinedRoute = () => {
    if (driver && riders.length > 0) {
      onViewGroupRoute(driver, riders);
      onClose(); // close modal after showing the route
    }
  };

  return (
    <div className="flex flex-col h-full">
      {curUser?.role === "DRIVER" ? (
        <div className="mx-20 flex flex-col py-1 flex-shrink-0">
          <div className="my-1 text-xs italic text-slate-400">
            Use this text box to share important communication with your riders!
          </div>
          <div className="flex flex-row divide-y-2 overflow-auto">
            <textarea
              className="form-input h-10 min-h-[50px] flex-grow resize-none rounded-md py-2 shadow-sm"
              maxLength={140}
              value={groupMessage}
              onChange={(e) => setGroupMessage(e.target.value)}
            />
            <button
              className="ml-8 h-full w-[150px] rounded-md bg-red-700 text-white"
              onClick={async () => {
                await handleMessageSubmit();
                toast.success("Group message successfully saved!");
              }}
            >
              Submit
            </button>
          </div>
        </div>
      ) : (
        <div className="mx-16 flex flex-col py-1 flex-shrink-0">
          <div className="text-center">Carpool Information from Driver</div>
          <br />
          <p className="flex-1 justify-center rounded-md border px-3 py-2 text-center text-sm shadow-sm">
            {groupMessage != ""
              ? groupMessage
              : "Keep a look out for messages from your driver on this message board!"}
          </p>
        </div>
      )}
      
      <div className="mx-16 mt-2 flex flex-col flex-grow min-h-0">
        <div className="flex flex-col divide-y-2 rounded-md border px-2 h-full overflow-y-auto">
          <GroupMembers users={users} onClose={onClose} />
        </div>
      </div>

      {/* combined route button */}
      {driver && riders.length > 0 && (
        <div className="mt-4 px-4 pb-4 flex-shrink-0">
          <div className="flex flex-col items-center">
            <button
              onClick={handleViewCombinedRoute}
              className="w-1/2 rounded-md bg-northeastern-red py-3 px-4 text-white font-medium hover:bg-red-700 transition-colors"
            >
              Preview Group Route
            </button>
            <p className="mt-2 text-xs text-gray-500 text-center max-w-xs mx-auto">
              Preview a combined route between the driver and all riders in your group
            </p>
          </div>
        </div>
      )}
    </div>
  );
};