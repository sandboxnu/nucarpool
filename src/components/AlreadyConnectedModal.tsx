import { Dialog } from "@headlessui/react";
import { useState } from "react";
import { PublicUser, User } from "../utils/types";

interface AlreadyConnectedModalProps {
  isDesktop: Boolean;
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
          <Dialog.Panel
            className={
              props.isDesktop
                ? "justify-center rounded-md shadow-md bg-white h-3/6 w-3/6 content-center flex flex-col p-9 gap-4"
                : "justify-center rounded-md shadow-md bg-white h-2/6 w-5/6 content-center flex flex-col p-6 gap-4"
            }
          >
            <Dialog.Title
              className={
                props.isDesktop
                  ? "font-bold text-2xl text-center"
                  : "font-bold text-xl text-center"
              }
            >
              You already have a pending request from this user
            </Dialog.Title>
            <div className="text-sm text-center">
              {props.userToConnectTo.preferredName} has already sent you a
              connection request. Click the manage request button below to
              accept or decline the request!
            </div>
            <div
              className={
                props.isDesktop
                  ? "flex justify-center space-x-7"
                  : "flex justify-center space-x-4"
              }
            >
              <button
                onClick={onClose}
                className={
                  props.isDesktop
                    ? "w-full p-1 text-red-700 bg-slate-50 border-2 border-red-700 rounded-md"
                    : "w-full text-sm p-1 text-red-700 bg-slate-50 border-2 border-red-700 rounded-md"
                }
              >
                Cancel
              </button>
              <button
                className={
                  props.isDesktop
                    ? "w-full p-1 text-slate-50 bg-red-700 border-2 border-red-700 rounded-md"
                    : "w-full text-sm p-1 text-slate-50 bg-red-700 border-2 border-red-700 rounded-md"
                }
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
