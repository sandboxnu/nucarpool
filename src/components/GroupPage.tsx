import { Dialog } from "@headlessui/react";
import { useState } from "react";
import { GroupMemberCard, GroupMembers } from "./Group/GroupMemberCard";
import { trpc } from "../utils/trpc";

/* TODO: 
2. Fix the group member card component to correctly display all information
3. Appropriately hit endpoints
*/
interface GroupPageProps {
  onClose: () => void;
}

export const GroupPage = (props: GroupPageProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const { data: group } = trpc.user.groups.me.useQuery();
  const users = group?.users ?? [];

  const onClose = () => {
    setIsOpen(false);
    props.onClose();
  };
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 backdrop-blur-sm" aria-hidden="true">
        <div className="fixed inset-0 flex items-center justify-center p-4">
          {/* dialog panel container  */}
          <Dialog.Panel className="flex h-4/6 w-4/6 flex-col content-center justify-center gap-4 rounded-md bg-white py-9 shadow-md">
            <Dialog.Title className="text-center text-2xl font-bold">
              Group Page
            </Dialog.Title>
            <div className="flex flex-grow flex-col overflow-auto px-20 py-10">
              <GroupMembers users={users} />
            </div>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
};
