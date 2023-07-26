import { Dialog } from "@headlessui/react";
import { ChangeEvent, useState } from "react";
import { useToasts } from "react-toast-notifications";
import { EnhancedPublicUser, PublicUser, User } from "../../utils/types";
import { toast } from "react-toastify";
import { emailSchema } from "../../utils/email";
import { trpc } from "../../utils/trpc";

interface ConnectModalProps {
  user: User;
  otherUser: EnhancedPublicUser;
  onClose: () => void;
}

const sendEmail = async (
  sendingEmail: string,
  receivingEmail: string,
  message: string
) => {
  const msg: emailSchema = {
    sendingUser: sendingEmail,
    receivingUser: receivingEmail,
    subject: "Carpool Connect Request",
    body: message,
  };

  const result = await fetch(`/api/email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(msg),
  });

  console.log(result);
};

const ConnectModal = (props: ConnectModalProps): JSX.Element => {
  const { addToast } = useToasts();
  const [isOpen, setIsOpen] = useState(true);
  const [customMessage, setCustomMessage] = useState(props.user.bio ?? "");

  const onClose = () => {
    setIsOpen(false);
    props.onClose();
  };

  const utils = trpc.useContext();
  const { mutate: createRequests } = trpc.user.requests.create.useMutation({
    onError: (error: any) => {
      toast.error(`Something went wrong: ${error.message}`);
    },
    onSuccess() {
      utils.user.recommendations.me.invalidate();
      utils.user.requests.me.invalidate();
    },
  });

  const handleOnClick = () => {
    if (props.user.email && props.otherUser.email) {
      sendEmail(props.user.email, props.otherUser.email, customMessage);
      createRequests({
        fromId: props.user.id,
        toId: props.otherUser.id,
        message: customMessage,
      });
      onClose();
      addToast(
        "A request to carpool has been sent to " + props.otherUser.name,
        { appearance: "success" }
      );
    } else {
      onClose();
      addToast(
        "A request from " +
          props.otherUser.name +
          "already exists. Navigate to your received requests tab to connect with them!",
        { appearance: "info" }
      );
    }
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
          <Dialog.Panel className="justify-center rounded-md shadow-md bg-white h-3/6 w-3/6 content-center flex flex-col p-9 gap-4">
            <Dialog.Title className="font-bold text-2xl text-center">
              Send an email to connect!
            </Dialog.Title>
            <div className="text-sm">
              Use the space below to write out a message to{" "}
              {props.otherUser.preferredName} and send a connection request. We
              recommend writing a bit about yourself, your schedule, and
              anything else you think would be good to know!
            </div>
            <textarea
              className={`resize-none form-input w-full shadow-sm rounded-md px-3 py-2`}
              maxLength={280}
              defaultValue={customMessage}
              onChange={handleMessageChange}
            ></textarea>
            <div className="text-xs italic text-slate-400">
              Note: The information you’ve provided in your intro is written
              here. Feel free to add or edit your intro message, or send it as
              is!
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
