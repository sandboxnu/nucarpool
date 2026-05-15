import { User, EnhancedPublicUser } from "../utils/types";
import { Request, Role } from "@prisma/client";
import { trpc } from "./trpc";
import { toast } from "react-toastify";

interface RequestHandlers {
  handleAcceptRequest: (
    user: User,
    otherUser: EnhancedPublicUser,
    request: Request,
  ) => Promise<void>;
  handleRejectRequest: (
    user: User,
    otherUser: EnhancedPublicUser,
    request: Request,
  ) => Promise<void>;
}

// Function to create the handlers
export const createRequestHandlers = (
  utils: ReturnType<typeof trpc.useContext>,
): RequestHandlers => {
  const deleteRequest = trpc.user.requests.delete.useMutation({
    onError: (error: any) => {
      toast.error(`Something went wrong: ${error.message}`);
    },
    onSuccess: () => {
      utils.user.requests.me.invalidate();
      utils.user.recommendations.me.invalidate();
    },
  });

  const mutateGroup = trpc.user.groups.edit.useMutation({
    onError: (error: any) => {
      toast.error(`Something went wrong: ${error.message}`);
    },
    onSuccess: () => {
      utils.user.requests.me.invalidate();
      utils.user.me.invalidate();
    },
  });

  const createGroup = trpc.user.groups.create.useMutation({
    onError: (error: any) => {
      toast.error(`Something went wrong: ${error.message}`);
    },
    onSuccess: () => {
      utils.user.requests.me.invalidate();
      utils.user.me.invalidate();
    },
  });

  const handleDelete = async (requestId: string) => {
    await deleteRequest.mutateAsync({
      invitationId: requestId,
    });
  };

  const validateRequestAcceptance = (
    user: User,
    otherUser: EnhancedPublicUser,
  ): boolean => {
    if (user.role === "DRIVER") {
      if (user.seatAvail === 0) {
        toast.error(
          `You do not have any space in your car to accept ${otherUser.preferredName}.`,
        );
        return false;
      }
      if (otherUser.carpoolId) {
        toast.error(
          `${otherUser.preferredName} is already in an existing carpool group. Ask them to leave that group before attempting to join yours.`,
        );
        return false;
      }
      return true;
    } else {
      if (user.carpoolId) {
        toast.error(
          `You cannot join ${otherUser.preferredName}'s group until leaving your current carpool group.`,
        );
        return false;
      }
      return true;
    }
  };

  const initiateGroup = async (user: User, otherUser: EnhancedPublicUser) => {
    if (user.role === Role.DRIVER) {
      if (user.carpoolId) {
        await mutateGroup.mutateAsync({
          driverId: user.id,
          riderId: otherUser.id,
          add: true,
          groupId: user.carpoolId,
        });
      } else {
        await createGroup.mutateAsync({
          driverId: user.id,
          riderId: otherUser.id,
        });
      }
    } else {
      if (otherUser.carpoolId) {
        await mutateGroup.mutateAsync({
          driverId: otherUser.id,
          riderId: user.id,
          add: true,
          groupId: otherUser.carpoolId,
        });
      } else {
        await createGroup.mutateAsync({
          driverId: otherUser.id,
          riderId: user.id,
        });
      }
    }
  };

  const handleAcceptRequest = async (
    user: User,
    otherUser: EnhancedPublicUser,
    request: Request,
  ) => {
    if (validateRequestAcceptance(user, otherUser)) {
      await initiateGroup(user, otherUser);
      toast.success(
        `${otherUser.preferredName}'s request to carpool with you has been accepted.`,
      );
    }
  };

  const handleRejectRequest = async (
    user: User,
    otherUser: EnhancedPublicUser,
    request: Request,
  ) => {
    await handleDelete(request.id);
    toast.success(
      `${otherUser.preferredName}'s request to carpool with you has been deleted.`,
    );
  };

  return {
    handleAcceptRequest,
    handleRejectRequest,
  };
};
