import { Dialog } from "@headlessui/react";
import { useState } from "react";
import { GroupMemberCard } from "./Group/GroupMemberCard";

interface GroupPageProps {
  onClose: () => void;
}

export const GroupPage = (props: GroupPageProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);

  const onClose = () => {
    setIsOpen(false);
    props.onClose();
  };
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 backdrop-blur-sm" aria-hidden="true">
        <div className="fixed inset-0 flex items-center justify-center p-4">
          {/* dialog panel container  */}
          <Dialog.Panel className="flex h-4/6 w-4/6 flex-col content-center justify-center gap-4 rounded-md bg-white p-9 shadow-md">
            <Dialog.Title className="text-center text-2xl font-bold">
              GroupPage
            </Dialog.Title>
            <div className="flex flex-grow flex-col overflow-auto px-20 py-10">
              <GroupMemberCard name="Remove" email="test" />
              <GroupMemberCard name="Delete Group" email="test2" />
              <GroupMemberCard name="Delete Group" email="test2" />
              <GroupMemberCard name="Delete Group" email="test2" />
              <GroupMemberCard name="Delete Group" email="test2" />
              <GroupMemberCard name="Delete Group" email="test2" />
              <GroupMemberCard name="Delete Group" email="test2" />
              <GroupMemberCard name="Delete Group" email="test2" />
              <GroupMemberCard name="Delete Group" email="test2" />
            </div>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
};
