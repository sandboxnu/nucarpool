import { Dialog } from "@headlessui/react";
import { useState } from "react";
import { useToasts } from "react-toast-notifications";
import { PublicUser, User } from "../utils/types";

interface ReceivedModalProps {
  // represents the 'me', the user trying to connect to someone
  currentUser: User;
  // represents the other user 'I' am trying to connect to.
  userToConnectTo: PublicUser;

  handleReject: () => void;

  handleAccept: () => void;

  closeModal: () => void;
}

const ReceivedRequestModal = (props: ReceivedModalProps): JSX.Element => {
  const { addToast } = useToasts();
  const [isOpen, setIsOpen] = useState(true);

  const onClose = () => {
    setIsOpen(false);
    props.closeModal();
  };

  const handleRejectClick = () => {
    props.handleReject();
    onClose();
    addToast(
      props.userToConnectTo.name +
        "'s request to carpool with you has been rejected.",
      { appearance: "success" }
    );
  };

  const handleAcceptClick = () => {
    props.handleAccept();
    onClose();
    addToast(
      props.userToConnectTo.name +
        "'s request to carpool with you has been accepted.",
      { appearance: "success" }
    );
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
              Manage Received Request
            </Dialog.Title>
            <div className="text-sm">
              We think you and {props.userToConnectTo.preferredName} would be a
              good carpool match! Have a look at their profile, and connect with
              them if they fit into your carpooling schedule!
            </div>
            <div className="flex justify-center space-x-7">
              <button
                onClick={handleRejectClick}
                className="w-full p-1 text-blue-900 bg-slate-50 border-2 border-blue-900 rounded-md"
              >
                Decline
              </button>
              <button
                onClick={handleAcceptClick}
                className="w-full p-1 text-slate-50 bg-blue-900 border-2 border-blue-900 rounded-md"
              >
                Accept
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
};

export default ReceivedRequestModal;
