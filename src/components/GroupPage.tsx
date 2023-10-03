import { Dialog } from "@headlessui/react";
import { useContext, useState } from "react";
import { GroupMembers } from "./Group/GroupMemberCard";
import { trpc } from "../utils/trpc";
import { UserContext } from "../utils/userContext";

interface GroupPageProps {
  onClose: () => void;
}

export const GroupPage = (props: GroupPageProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const { data: group } = trpc.user.groups.me.useQuery();
  const users = group?.users ?? [];
  const { mutate: updateMessage } =
    trpc.user.groups.updateMessage.useMutation();
  const curUser = useContext(UserContext);

  const onClose = () => {
    setIsOpen(false);
    props.onClose();
  };

  const MessageBox = () => {
    const [groupMessage, setGroupMessage] = useState(group?.message ?? "");

    const handleSubmit = async () => {
      if (group?.id && curUser?.role === "DRIVER") {
        await updateMessage({ groupId: group.id, message: groupMessage });
      }
    };

    if (curUser?.role === "DRIVER") {
      return (
        <div className="mx-16 mt-4 flex flex-row divide-y-2 overflow-auto">
          <textarea
            className="form-input h-10 min-h-[60px] flex-grow resize-none rounded-md px-3 py-2 shadow-sm"
            maxLength={140}
            value={groupMessage}
            onChange={(e) => setGroupMessage(e.target.value)}
          />
          <button
            className="mx-2 h-full w-[150px] rounded-md bg-red-700 text-white"
            onClick={handleSubmit}
          >
            Submit
          </button>
        </div>
      );
    } else {
      return (
        <div className="flex items-center py-3">
          <p className="mx-2 flex-1 text-xl">
            {groupMessage != ""
              ? groupMessage
              : "Your driver has not shared a message yet."}
          </p>
        </div>
      );
    }
  };
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 backdrop-blur-sm" aria-hidden="true">
        <div className="fixed inset-0 flex items-center justify-center p-4">
          {/* dialog panel container  */}
          <Dialog.Panel className="flex h-4/6 w-4/6 flex-col content-center justify-center gap-4 rounded-md bg-white py-9 shadow-md">
            <Dialog.Title className="text-center text-3xl font-bold">
              Group Page
            </Dialog.Title>
            <MessageBox />
            <div className="mx-14 mt-4 flex flex-grow flex-col divide-y-2 overflow-auto rounded-md border px-10">
              <GroupMembers users={users} onClose={onClose} />
            </div>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
};
