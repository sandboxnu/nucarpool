import { EnhancedPublicUser, PublicUser } from "../utils/types";
import { User } from "@prisma/client";
import { ConnectCard } from "./UserCards/ConnectCard";
import { Dialog } from "@headlessui/react";

interface ConnectPortalProps {
  otherUser: PublicUser | null;
  extendUser: (user: PublicUser) => EnhancedPublicUser;
  onViewRouteClick: (user: User, otherUser: PublicUser) => void;
  onViewRequest: (userId: string) => void;
  onClose: () => void;
}

export const MapConnectPortal = (props: ConnectPortalProps) => {
  return (
    <Dialog
      open={!!props.otherUser}
      onClose={props.onClose}
      className="relative z-50"
    >
      <div className="fixed inset-0" aria-hidden="true">
        <div className="fixed inset-0 mt-16 flex items-start justify-end pt-2">
          <Dialog.Panel>
            <div>
              <div tabIndex={0} className="w-96">
                {props.otherUser && (
                  <ConnectCard
                    otherUser={props.extendUser(props.otherUser)}
                    onViewRouteClick={props.onViewRouteClick}
                    onViewRequest={props.onViewRequest}
                    onClose={(string) => {
                      string == "connect" ? props.onClose() : {};
                    }}
                  />
                )}
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
};
