import { EnhancedPublicUser, PublicUser } from "../../utils/types";
import Spinner from "../Spinner";
import { ButtonInfo } from "../../utils/types";
import { trpc } from "../../utils/trpc";

interface CardProps {
  otherUser: EnhancedPublicUser;
}
export const ConnectCard = (props: CardProps): JSX.Element => {
  return <div>Whattttt</div>;
};

export const ReceivedCard = (props: CardProps): JSX.Element => {
  return <div>Whattttt</div>;
};

export const SentCard = (props: CardProps): JSX.Element => {
  return <div>Whattttt</div>;
};

export const renderUserCard = (
  cardType: string,
  otherUser: EnhancedPublicUser
): JSX.Element => {
  switch (cardType) {
    case "connect":
    case "favorite":
      const connectButtonInfo: ButtonInfo = {
        text: "Connect",
        onPress: handleConnect,
      };
      return <ConnectCard otherUser={otherUser} />;
    case "sent":
      return <SentCard otherUser={otherUser} />;
    case "received":
      return <ReceivedCard otherUser={otherUser} />;
    default:
      return <Spinner />;
  }
};
