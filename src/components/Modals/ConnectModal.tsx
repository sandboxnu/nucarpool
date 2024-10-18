import { Dialog } from "@headlessui/react";
import React, { useState } from "react";
import { useToasts } from "react-toast-notifications";
import { EnhancedPublicUser, User } from "../../utils/types";
import { toast } from "react-toastify";
import { BaseEmailSchema } from "../../utils/email";
import { trpc } from "../../utils/trpc";

interface ConnectModalProps {
  user: User;
  otherUser: EnhancedPublicUser;
  onClose: (action: string) => void;
  onViewRequest: (userId: string) => void;
}

const ConnectModal = (props: ConnectModalProps): JSX.Element => {
  const { addToast } = useToasts();
  const [isOpen, setIsOpen] = useState(true);
  const [emailSent, setEmailSent] = useState(false); // State to track if the email has been sent
  const [customMessage, setCustomMessage] = useState(props.user.bio ?? "");

  const onClose = (action: string) => {
    setIsOpen(false);
    props.onClose(action);
  };
  const handleViewRequest = (e: React.MouseEvent) => {
    props.onViewRequest(props.otherUser.id);
    props.onClose("connect");
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
  const { mutate: sendConnectEmail } =
    trpc.user.emails.sendRequestNotification.useMutation({
      onError: (error: any) => {
        toast.error(`Something went wrong: ${error.message}`);
      },
      onSuccess: () => {
        console.log("Email sent successfully");
        setEmailSent(true); // Update state to reflect email has been sent
      },
    });

  const handleOnClick = () => {
    if (props.user.email && props.otherUser.email) {
      sendConnectEmail({
        senderName: props.user.preferredName,
        senderEmail: props.user.email,
        receiverName: props.otherUser.preferredName,
        receiverEmail: props.otherUser.email,
        isDriver: props.otherUser.role === "DRIVER",
        messagePreview: customMessage,
      });
      createRequests({
        fromId: props.user.id,
        toId: props.otherUser.id,
        message: customMessage,
      });
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
      <div className="fixed inset-0 backdrop-blur-sm" aria-hidden="true">
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="flex h-4/6 w-5/6 flex-col content-center justify-center gap-4 overflow-auto rounded-md bg-white p-9 shadow-md sm:h-4/6 sm:w-4/6 md:h-3/6 md:w-3/6">
            {!emailSent ? (
              <>
                <Dialog.Title className="text-center text-2xl font-bold">
                  Send a message to connect!
                </Dialog.Title>
                <div className="text-sm">
                  Use the space below to write out a message to&nbsp;
                  {props.otherUser.preferredName} with any details you want them
                  to know about your request. We&apos;ll also connect you via
                  email.
                </div>
                <textarea
                  className="form-input h-24 min-h-[120px] w-full resize-none rounded-md px-3 py-2 shadow-sm"
                  maxLength={255}
                  defaultValue={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                ></textarea>
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
                    Send Message
                  </button>
                </div>
              </>
            ) : (
              <>
                <Dialog.Title className="text-center text-2xl font-bold">
                  Your request has been sent!
                </Dialog.Title>
                <div className="text-center">
                  Click below to view or continue exploring.
                </div>
                <div className="flex justify-center space-x-7">
                  <button
                    onClick={() => onClose("close")}
                    className="w-full rounded-md border-2 border-red-700 bg-slate-50 p-1 text-red-700"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleViewRequest}
                    className="w-full rounded-md border-2 border-red-700 bg-red-700 p-1 text-slate-50"
                  >
                    View Request
                  </button>
                </div>
              </>
            )}
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
};

export default ConnectModal;
