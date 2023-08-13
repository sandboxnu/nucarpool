import { Role } from "@prisma/client";
import { User, EnhancedPublicUser } from "./types";
import { trpc } from "./trpc";
import { toast } from "react-toastify";

function initiateGroup(user: User, otherUser: EnhancedPublicUser): void {
  const utils = trpc.useContext();

  const { mutate: mutateGroup } = trpc.user.groups.edit.useMutation({
    onError: (error: any) => {
      toast.error(`Something went wrong: ${error.message}`);
    },
    onSuccess() {
      utils.user.requests.me.invalidate();
    },
  });

  const { mutate: createGroup } = trpc.user.groups.create.useMutation({
    onError: (error: any) => {
      toast.error(`Something went wrong: ${error.message}`);
    },
    onSuccess() {
      utils.user.requests.me.invalidate();
    },
  });

  if (user.role === Role.DRIVER) {
    if (user.carpoolId) {
      mutateGroup({ userId: otherUser.id, add: true, groupId: user.carpoolId });
    } else {
      createGroup({ userId: user.id, otherUserId: otherUser.id });
    }
  } else {
    if (otherUser.carpoolId) {
      mutateGroup({ userId: user.id, add: true, groupId: otherUser.carpoolId });
    } else {
      createGroup({ userId: user.id, otherUserId: otherUser.id });
    }
  }
}

export default initiateGroup;
