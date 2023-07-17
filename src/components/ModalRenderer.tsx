import { SetStateAction } from "react";
import { PublicUser, User } from "../utils/types";
import ConnectModal from "./ConnectModal";

interface ModalRenderProps {
  curUser: User | undefined;
  otherUser: PublicUser | null;
  setOtherUser: (val: SetStateAction<PublicUser | null>) => void;
  modalType: string;
}

export const ModalRenderer = (props: ModalRenderProps): JSX.Element | null => {
  const setNullUser = () => {
    props.setOtherUser(null);
  };

  if (props.curUser && props.otherUser) {
    switch (props.modalType) {
      case "connect":
        return (
          <ConnectModal
            curUser={props.curUser}
            otherUser={props.otherUser}
            closeModal={() => setNullUser()}
          />
        );
    }
    // {user && modalUser && modalType === "already-requested" && (
    //   <AlreadyConnectedModal
    //     currentUser={user}
    //     userToConnectTo={modalUser}
    //     handleManageRequest={() => handleNavigateToRequests(true)}
    //     closeModal={() => {
    //       setModalUser(null);
    //     }}
    //   />
    // )}
    // {user && modalUser && modalType === "sent" && (
    //   <SentRequestModal
    //     currentUser={user}
    //     userToConnectTo={modalUser}
    //     handleWithdraw={() => handleWithdrawRequest(modalUser)}
    //     closeModal={() => {
    //       setModalUser(null);
    //     }}
    //   />
    // )}
    // {user && modalUser && modalType === "received" && (
    //   <ReceivedRequestModal
    //     currentUser={user}
    //     userToConnectTo={modalUser}
    //     handleReject={() => handleRejectRequest(modalUser)}
    //     handleAccept={() => handleAcceptRequest(modalUser)}
    //     closeModal={() => {
    //       setModalUser(null);
    //     }}
    //   />
    // )}
  }
  return null;
};
