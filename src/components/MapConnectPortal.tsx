import { EnhancedPublicUser, PublicUser } from "../utils/types";
import { User } from "@prisma/client";
import { ConnectCard } from "./UserCards/ConnectCard";
import { Dialog } from "@headlessui/react";
import { useRef } from "react";

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
      <div className="fixed inset-0">
        <div className="fixed inset-0 mt-20 flex items-start justify-end pt-4">
          <Dialog.Panel>
            <div className="max-h-100vh relative mt-11 w-[26rem] ">
              <div
                tabIndex={0}
                className="mr-3  max-h-[calc(100vh-8rem)] overflow-y-scroll  scrollbar  scrollbar-track-transparent scrollbar-thumb-northeastern-red scrollbar-track-rounded-full scrollbar-thumb-rounded-full"
                style={{
                  maskImage:
                    "linear-gradient(to bottom, transparent 0%, black 5%, black 95%, transparent 100%)",
                  maskSize: "100% 100%",
                  maskRepeat: "no-repeat",
                  marginTop: "-8%",
                  paddingTop: "15%",
                  marginBottom: "15%",
                  paddingBottom: "15%",
                }}
              >
                {props.otherUsers &&
                  props.otherUsers.map((user: PublicUser) => (
                    <div key={user.id}>
                      <ConnectCard
                        otherUser={props.extendUser(user)}
                        onViewRouteClick={props.onViewRouteClick}
                        onViewRequest={props.onViewRequest}
                        onClose={(action) => {
                          if (action === "connect") props.onClose();
                        }}
                      />
                    </div>
                  ))}
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
};
