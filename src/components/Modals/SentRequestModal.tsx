import { Dialog } from "@headlessui/react";
import { useState } from "react";
import { useToasts } from "react-toast-notifications";
import { EnhancedPublicUser, User } from "../../utils/types";
import { toast } from "react-toastify";
import { trpc } from "../../utils/trpc";
import { Request } from "@prisma/client";

interface SentModalProps {
  user: User;
  otherUser: EnhancedPublicUser;
  req: Request;
  onClose: () => void;
}

const SentRequestModal = (props: SentModalProps): JSX.Element => {
  const { addToast } = useToasts();
  const [isOpen, setIsOpen] = useState(true);

  const onClose = () => {
    setIsOpen(false);
    props.onClose();
  };

  const utils = trpc.useContext();
  const { mutate: deleteRequest } = trpc.user.requests.delete.useMutation({
    onError: (error: any) => {
      toast.error(`Something went wrong: ${error.message}`);
    },
    onSuccess() {
      utils.user.requests.me.invalidate();
      utils.user.recommendations.me.invalidate();
    },
  });

  const handleWithdrawRequest = () => {
    deleteRequest({
      invitationId: props.req.id,
    });
  };

  const handleWithdrawClick = () => {
    handleWithdrawRequest();
    onClose();
    addToast(
      "Your request to carpool with " +
        props.otherUser.name +
        " has been withdrawn.",
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
              Manage Sent Request
            </Dialog.Title>
            <div className="text-sm text-center">
              {" "}
              {props.otherUser.preferredName} has not yet responded. If
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
                onClick={handleWithdrawClick}
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
