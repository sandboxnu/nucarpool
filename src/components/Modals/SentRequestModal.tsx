import { Dialog } from "@headlessui/react";
import { useState } from "react";
import { useToasts } from "react-toast-notifications";
import { EnhancedPublicUser, User } from "../../utils/types";
import { toast } from "react-toastify";
import { trpc } from "../../utils/trpc";
import { Request } from "@prisma/client";
import React from 'react';

interface SentModalProps {
  user: User;
  otherUser: EnhancedPublicUser;
  req: Request;
  onClose: () => void;
}

const SentRequestModal = (props: SentModalProps): React.JSX.Element => {
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
        props.otherUser.preferredName +
        " has been withdrawn.",
      { appearance: "success" },
    );
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* backdrop panel */}
      <div className="fixed inset-0 backdrop-blur-sm" aria-hidden="true">
        {/* Full-screen container to center the panel */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          {/* dialog panel container  */}
          <Dialog.Panel className="flex h-2/6 w-2/6 flex-col content-center justify-center gap-4 overflow-auto rounded-md bg-white p-9 shadow-md">
            <Dialog.Title className="text-center text-2xl font-bold">
              Manage Sent Request
            </Dialog.Title>
            <div className="text-center text-sm">
              {" "}
              {props.otherUser.preferredName} has not yet responded. If
              you&apos;d like to, you can withdraw your request.
            </div>
            <div className="flex justify-center space-x-7">
              <button
                onClick={onClose}
                className="w-full rounded-md border-2 border-northeastern-red p-1 text-northeastern-red"
              >
                Cancel
              </button>
              <button
                onClick={handleWithdrawClick}
                className="w-full rounded-md border-2 border-northeastern-red bg-northeastern-red p-1 text-slate-50"
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
