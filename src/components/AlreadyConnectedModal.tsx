import { Dialog } from "@headlessui/react";
import { useState } from "react";
import { PublicUser, User } from "../utils/types";

interface AlreadyConnectedModalProps {
  // represents the 'me', the user trying to connect to someone
  currentUser: User;
  // represents the other user 'I' am trying to connect to.
  userToConnectTo: PublicUser;

  closeModal: () => void;
  handleManageRequest: () => void;
}

const AlreadyConnectedModal = (
  props: AlreadyConnectedModalProps
): JSX.Element => {
  const [isOpen, setIsOpen] = useState(true);

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
              You already have a pending request from this user
            </Dialog.Title>
            <div className="text-sm">
              {props.userToConnectTo.preferredName} has already sent you a
              connection request. Click the manage request button below to
              accept or decline the request!
            </div>
            <div className="flex justify-center space-x-7">
              <button
                onClick={onClose}
                className="w-full p-1 text-red-700 bg-slate-50 border-2 border-red-700 rounded-md"
              >
                Cancel
              </button>
              <button
                className="w-full p-1 text-slate-50 bg-red-700 border-2 border-red-700 rounded-md"
                onClick={() => {
                  onClose();
                  props.handleManageRequest();
                }}
              >
                Manage Request
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
};

export default AlreadyConnectedModal;