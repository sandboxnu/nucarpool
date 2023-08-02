import { Dispatch, SetStateAction, useState } from "react";
import { EnhancedPublicUser, PublicUser } from "../utils/types";
import { User } from "@prisma/client";
import { createPortal } from "react-dom";
import { ConnectCard } from "./UserCards/ConnectCard";
import { Dialog } from "@headlessui/react";
import { boolean } from "zod";

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
      <div className="fixed inset-0 backdrop-blur-sm" aria-hidden="true">
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel>
            <div>
              <ConnectCard
                otherUser={props.otherUser}
                onViewRouteClick={props.onViewRouteClick}
              />
            </div>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
};
