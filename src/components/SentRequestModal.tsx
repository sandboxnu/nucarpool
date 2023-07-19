import { Dialog } from "@headlessui/react";
import { useContext, useState } from "react";
import { PublicUser, User } from "../utils/types";
import { UserContext } from "../utils/userContext";
import Spinner from "./Spinner";

interface SentModalProps {
  userToConnectTo: PublicUser;
  closeModal: () => void;
}

const SentRequestModal = (props: SentModalProps): JSX.Element => {
  const curUser = useContext(UserContext);
  const [isOpen, setIsOpen] = useState(true);

  if (!curUser) {
    return <Spinner />;
  }

  const onClose = () => {
    setIsOpen(false);
    props.closeModal();
  };
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* backdrop panel */}
      <div className="fixed inset-0 backdrop-blur-sm" aria-hidden="true">
        {/* Full-screen container to center the panel */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          {/* dialog panel container  */}
          <Dialog.Panel className="justify-center rounded-md shadow-md bg-white h-3/6 w-3/6 content-center flex flex-col p-9 gap-4">
            <Dialog.Title className="font-bold text-2xl text-center">
              Manage Sent Request
            </Dialog.Title>
            <div className="text-sm text-center">
              {" "}
              {props.userToConnectTo.preferredName} has not yet responded. If
              you&apos;d like to, you can withdraw your request.
            </div>
            <div className="flex justify-center space-x-7">
              <button
                onClick={onClose}
                className="w-full p-1 text-blue-900 bg-slate-50 border-2 border-blue-900 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onClose();
                }}
                className="w-full p-1 text-slate-50 bg-blue-900 border-2 border-blue-900 rounded-md"
              >
                Withdraw Request
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
};

export default SentRequestModal;
