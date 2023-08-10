import { Dispatch, SetStateAction, useState } from "react";
import { EnhancedPublicUser, PublicUser } from "../utils/types";
import { User } from "@prisma/client";
import { ConnectCard } from "./UserCards/ConnectCard";
import { Dialog } from "@headlessui/react";

interface ConnectPortalProps {
  otherUser: EnhancedPublicUser;
  onViewRouteClick: (user: User, otherUser: PublicUser) => void;
  setPopupUser: Dispatch<SetStateAction<PublicUser | null>>;
}

export const MapConnectPortal = (props: ConnectPortalProps) => {
  const [isOpen, setIsOpen] = useState(true);

  const onClose = () => {
    setIsOpen(false);
    props.setPopupUser(null);
  };
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0" aria-hidden="true">
        <div className="fixed inset-0 mt-16 flex items-start justify-end pt-2">
          <Dialog.Panel>
            <div>
              <div tabIndex={0} className="w-96">
                <ConnectCard
                  otherUser={props.otherUser}
                  onViewRouteClick={props.onViewRouteClick}
                  onClose={onClose}
                />
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
};
