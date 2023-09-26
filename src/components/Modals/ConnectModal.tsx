import { Dialog } from "@headlessui/react";
import { useState } from "react";
import { useToasts } from "react-toast-notifications";
import { EnhancedPublicUser, User } from "../../utils/types";
import { toast } from "react-toastify";
import { emailSchema } from "../../utils/email";
import { trpc } from "../../utils/trpc";

interface ConnectModalProps {
  user: User;
  otherUser: EnhancedPublicUser;
  onClose: (action: string) => void;
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

  // console.log(result);
};

const ConnectModal = (props: ConnectModalProps): JSX.Element => {
  const { addToast } = useToasts();
  const [isOpen, setIsOpen] = useState(true);
  const [customMessage, setCustomMessage] = useState(props.user.bio ?? "");

  const onClose = (action: string) => {
    setIsOpen(false);
    props.onClose(action);
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
      onClose("connect");
      addToast(
        "A request to carpool has been sent to " +
          props.otherUser.preferredName,
        { appearance: "success" }
      );
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={() => onClose("close")}
      className="relative z-50"
    >
      {/* backdrop panel */}
      <div className="fixed inset-0 backdrop-blur-sm" aria-hidden="true">
        {/* Full-screen container to center the panel */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          {/* dialog panel container  */}
          <Dialog.Panel className="flex h-4/6 w-5/6 flex-col content-center justify-center gap-4 rounded-md bg-white p-9 shadow-md sm:h-4/6 sm:w-4/6 md:h-3/6 md:w-3/6">
            <Dialog.Title className="text-center text-2xl font-bold">
              Send an email to connect!
            </Dialog.Title>
            <div className="text-sm">
              Use the space below to write out a message to{" "}
              {props.otherUser.preferredName} and send a connection request. We
              recommend writing a bit about yourself, your schedule, and
              anything else you think would be good to know!
            </div>
            <textarea
              className={`form-input h-24 min-h-[120px] w-full resize-none rounded-md px-3 py-2 shadow-sm`}
              maxLength={280}
              defaultValue={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
            ></textarea>
            <div className="text-xs italic text-slate-400">
              Note: The information you’ve provided in your intro is written
              here. Feel free to add or edit your intro message, or send it as
              is!
            </div>
            <div className="flex justify-center space-x-7">
              <button
                onClick={() => onClose("close")}
                className="w-full rounded-md border-2 border-red-700 bg-slate-50 p-1 text-red-700"
              >
                Cancel
              </button>
              <button
                className="w-full rounded-md border-2 border-red-700 bg-red-700 p-1 text-slate-50"
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
