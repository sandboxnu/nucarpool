import { Dialog } from "@headlessui/react";
import { useContext, useState, useEffect } from "react";
import { GroupMembers } from "./Group/GroupMemberCard";
import { trpc } from "../utils/trpc";
import { UserContext } from "../utils/userContext";
import { Role, User } from "@prisma/client";
import Spinner from "./Spinner";
import { toast } from "react-toastify";
import { TRPCClientError } from "@trpc/client";
import { useToasts } from "react-toast-notifications";

interface GroupPageProps {
  onClose: () => void;
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
          {/* dialog panel container  */}
          <Dialog.Panel className="flex h-4/6 w-4/6 flex-col content-center justify-center gap-4 overflow-scroll rounded-md bg-white py-9 shadow-md">
            <Dialog.Title className="text-center text-3xl font-bold">
              Group Page
            </Dialog.Title>
            <GroupBody curUser={curUser} onClose={onClose} />
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
};

const GroupBody = ({
  curUser,
  onClose,
}: {
  curUser: User;
  onClose: () => void;
}) => {
  return !curUser?.carpoolId ? (
    <NoGroupInfo role={curUser.role} onClose={onClose} />
  ) : (
    <GroupInfo curUser={curUser} onClose={onClose} />
  );
};

interface NoGroupInfoProps {
  role: Role;
  onClose: () => void;
}

const NoGroupInfo = ({ role, onClose }: NoGroupInfoProps) => {
  const utils = trpc.useContext();
  const { data: user } = trpc.user.me.useQuery();
  const [groupMessage, setGroupMessage] = useState(user?.groupMessage ?? "");
  const { mutate: updateUserMessage } = trpc.user.groups.updateUserMessage.useMutation({
    onSuccess: () => {
      // Invalidate and refetch the user.me query
      utils.user.me.invalidate();
    },
  });

  useEffect(() => {
    if (user?.groupMessage) {
      setGroupMessage(user.groupMessage);
    }
  }, [user]);

  const handleMessageSubmit = async () => {
    if (user?.id && role === "DRIVER") {
      await updateUserMessage({ message: groupMessage });
    }
  };

  return (
    <div className="flex flex-col">
      {role === Role.VIEWER ? (
        <div className="flex flex-grow items-center justify-center text-xl font-light">
          You are in Viewer mode, switch to Rider or Driver to join a group
        </div>
      ) : (
        <>
          {role === "DRIVER" && (
            <div className="mx-20 flex flex-col py-1 mb-8">
              <div className="my-1 text-xs italic text-slate-400">
                Below, share any information that you would like riders joining you your Carpool to know. You can indicate when you generally like to be leaving your place, what your preferred method of communication is, what your preference is to split gas and what your Carpool vibe will be like.
              </div>
              <div className="flex flex-row gap-2">
                <textarea
                  className="form-input min-h-[50px] flex-grow resize-none rounded-md py-2 shadow-sm"
                  value={groupMessage}
                  onChange={(e) => setGroupMessage(e.target.value)}
                />
                <button
                  className="w-[150px] rounded-md bg-red-700 py-2 text-white h-full"
                  onClick={async () => {
                    await handleMessageSubmit();
                    toast.success('Group message successfully saved!');
                  }}
                >
                  Submit
                </button>
              </div>
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
}: {
  curUser: User;
  onClose: () => void;
}) => {
  const utils = trpc.useContext();
  const { data: group } = trpc.user.groups.me.useQuery();
  const users = group?.users ?? [];
  const [groupMessage, setGroupMessage] = useState(group?.message ?? "");
  const { mutate: updateMessage } = trpc.user.groups.updateMessage.useMutation({
    onSuccess: () => {
      // Invalidate and refetch the groups.me query
      utils.user.groups.me.invalidate();
    },
  });
  const { mutate: updateUserMessage } = trpc.user.groups.updateUserMessage.useMutation({
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

  return (
    <>
      {curUser?.role === "DRIVER" ? (
        <div className="mx-20 flex flex-col py-1">
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
                toast.success('Group message successfully saved!');
              }}
            >
              Submit
            </button>
          </div>
        </div>
      ) : (
        <div className="mx-16 flex flex-col py-1">
          <div className="text-center">Carpool Information from Driver</div>
          <br/>
          <p className="flex-1 justify-center rounded-md border px-3 py-2 text-center text-sm shadow-sm">
            {groupMessage != ""
              ? groupMessage
              : "Keep a look out for messages from your driver on this message board!"}
          </p>
        </div>
      )}
      <div className="mx-16 mt-2 flex flex-grow flex-col divide-y-2 rounded-md border px-2">
        <GroupMembers users={users} onClose={onClose} />
      </div>
    </>
  );
};