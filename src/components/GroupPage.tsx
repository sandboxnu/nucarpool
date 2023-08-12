import { Dialog } from "@headlessui/react";
import { useState } from "react";

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
        {/* Full-screen container to center the panel */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          {/* dialog panel container  */}
          <Dialog.Panel className="flex h-5/6 w-5/6 flex-col content-center justify-center gap-4 rounded-md bg-white p-9 shadow-md sm:h-5/6 sm:w-5/6 md:h-4/6 md:w-4/6 ">
            <Dialog.Title className="text-center text-2xl font-bold">
              GroupPage
            </Dialog.Title>
            <div className="flex flex-grow"></div>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
};
