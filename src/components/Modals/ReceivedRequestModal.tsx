import { Dialog } from "@headlessui/react";
import { useState } from "react";
import { useToasts } from "react-toast-notifications";
import { EnhancedPublicUser, User } from "../../utils/types";
import { Request } from "@prisma/client";
import { trpc } from "../../utils/trpc";
import { toast } from "react-toastify";
import initiateGroup from "../../utils/group";

interface ReceivedModalProps {
  user: User;
  otherUser: EnhancedPublicUser;
  req: Request;
  onClose: () => void;
}

const ReceivedRequestModal = (props: ReceivedModalProps): JSX.Element => {
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

  const handleDelete = () => {
    deleteRequest({
      invitationId: props.req.id,
    });
  };

  const handleRejectClick = () => {
    handleDelete();
    onClose();
    addToast(
      props.otherUser.preferredName +
        "'s request to carpool with you has been deleted.",
      { appearance: "success" }
    );
  };

  const validateRequestAcceptance = () => {
    if (props.user.role == "DRIVER") {
      if (props.user.seatAvail === 0) {
        addToast(
          "You do not have any space in your car to accept " +
            props.otherUser.preferredName
        );
        return false;
      }
      if (props.otherUser.carpoolId) {
        addToast(
          props.otherUser.preferredName +
            " is already in an existing carpool group. Ask them to leave that group before attempting to join yours"
        );
        return false;
      }
      return true;
    } else {
      if (props.user.carpoolId) {
        addToast(
          "You cannot join " +
            props.otherUser.preferredName +
            "'s group until leaving your current carpool group"
        );
        return false;
      }
      return true;
    }
  };

  const handleAcceptClick = () => {
    if (validateRequestAcceptance()) {
      initiateGroup(props.user, props.otherUser);
      handleDelete();
      onClose();
      addToast(
        props.otherUser.preferredName +
          "'s request to carpool with you has been accepted.",
        { appearance: "success" }
      );
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* backdrop panel */}
      <div className="fixed inset-0 backdrop-blur-sm" aria-hidden="true">
        {/* Full-screen container to center the panel */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          {/* dialog panel container  */}
          <Dialog.Panel className="flex h-3/6 w-3/6 flex-col content-center justify-center gap-4 rounded-md bg-white p-9 shadow-md">
            <Dialog.Title className="text-center text-2xl font-bold">
              Manage Received Request
            </Dialog.Title>
            <div className="text-sm">
              {props.otherUser.preferredName} thinks they would be a good
              carpool match for you! Have a look at their profile, and connect
              with them if they fit into your carpooling schedule!
            </div>
            <div className="flex justify-center space-x-7">
              <button
                onClick={handleRejectClick}
                className="w-full rounded-md border-2 border-blue-900 bg-slate-50 p-1 text-blue-900"
              >
                Decline
              </button>
              <button
                onClick={handleAcceptClick}
                className="w-full rounded-md border-2 border-blue-900 bg-blue-900 p-1 text-slate-50"
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
