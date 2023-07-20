import { Dialog } from "@headlessui/react";
import { ChangeEvent, useState } from "react";
import { useToasts } from "react-toast-notifications";
import { PublicUser, User } from "../utils/types";

interface ConnectModalProps {
  isDesktop: Boolean;
  // represents the 'me', the user trying to connect to someone
  currentUser: User;
  // represents the other user 'I' am trying to connect to.
  userToConnectTo: PublicUser;

  handleEmailConnect: (message: string) => void;

  closeModal: () => void;
}

const ConnectModal = (props: ConnectModalProps): JSX.Element => {
  const { addToast } = useToasts();
  const [isOpen, setIsOpen] = useState(true);
  const [customMessage, setCustomMessage] = useState(
    props.currentUser.bio ?? ""
  );

  const onClose = () => {
    setIsOpen(false);
    props.closeModal();
  };

  const handleOnClick = () => {
    props.handleEmailConnect(customMessage);
    onClose();
    addToast(
      "A request to carpool has been sent to " + props.userToConnectTo.name,
      { appearance: "success" }
    );
  };

  const handleMessageChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setCustomMessage(event.target.value);
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
                : "justify-center rounded-md shadow-md bg-white h-4/6 w-5/6 content-center flex flex-col p-6 gap-4"
            }
          >
            <Dialog.Title
              className={
                props.isDesktop
                  ? "font-bold text-2xl text-center"
                  : "font-bold text-xl text-center"
              }
            >
              Send an email to connect!
            </Dialog.Title>
            <div
              className={
                props.isDesktop ? "text-sm text-center" : "text-xs text-center"
              }
            >
              Use the space below to write out a message to{" "}
              {props.userToConnectTo.preferredName} and send a connection
              request. We recommend writing a bit about yourself, your schedule,
              and anything else you think would be good to know!
            </div>
            <textarea
              className={`h-2/6 resize-none form-input w-full shadow-sm rounded-md px-3 py-2`}
              maxLength={280}
              defaultValue={customMessage}
              onChange={handleMessageChange}
            ></textarea>
            <div className="text-xs italic text-slate-400">
              Note: The information you’ve provided in your intro is written
              here. Feel free to add or edit your intro message, or send it as
              is!
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
                onClick={handleOnClick}
              >
                Send Email
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
};

export default ConnectModal;
