import { EnhancedPublicUser, PublicUser } from "../utils/types";
import { User } from "@prisma/client";
import { ConnectCard } from "./UserCards/ConnectCard";
import { Dialog } from "@headlessui/react";

interface ConnectPortalProps {
  otherUsers: PublicUser[] | null;
  extendUser: (user: PublicUser) => EnhancedPublicUser;
  onViewRouteClick: (user: User, otherUser: PublicUser) => void;
  onViewRequest: (userId: string) => void;
  onClose: () => void;
}

export const MapConnectPortal = (props: ConnectPortalProps) => {
  return (
    <Dialog
      open={!!(props.otherUsers && props.otherUsers.length > 0)}
      onClose={props.onClose}
      className="relative z-50"
    >
      <div className="fixed inset-0" aria-hidden="true">
        <div className="fixed inset-0 mt-20 flex items-start justify-end pt-2">
          <Dialog.Panel>
            <div>
              <div
                tabIndex={0}
                className="max-h-[calc(100vh-8rem)] w-96 overflow-y-scroll scrollbar-none"
              >
                {props.otherUsers &&
                  props.otherUsers.map((user: PublicUser) => (
                    <ConnectCard
                      key={user.id}
                      otherUser={props.extendUser(user)}
                      onViewRouteClick={props.onViewRouteClick}
                      onViewRequest={props.onViewRequest}
                      onClose={(string) => {
                        string == "connect" ? props.onClose() : {};
                      }}
                    />
                  ))}
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
};
