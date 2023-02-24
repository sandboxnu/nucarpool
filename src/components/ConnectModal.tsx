import { PublicUser, User } from "../utils/types";
import { TextField } from "./TextField";

interface ConnectModalProps {
  // represents the 'me', the user trying to connect to someone
  currentUser: User;
  // represents the other user 'I' am trying to connect to.
  userToConnectTo: PublicUser;

  closeModal: () => void;
}

export default function ConnectModal(props: ConnectModalProps): JSX.Element {
  return (
    <div className="justify-center rounded-md shadow-lg bg-white h-4/6 w-3/6 content-center flex flex-col p-9 gap-4">
      <div className="font-bold text-2xl text-center">
        Send an email to connect!
      </div>

      <div className="text-sm">
        Use the space below to write out a message to{" "}
        {props.userToConnectTo.preferredName} and send a connection request. We
        recommend writing a bit about yourself, your schedule, and anything else
        you think would be good to know!
      </div>
      <textarea
        className={`resize-none form-input w-full shadow-sm rounded-md px-3 py-2`}
        maxLength={280}
        defaultValue={props.currentUser.bio}
      ></textarea>

      <div className="text-xs italic text-slate-400">
        Note: The information you’ve provided in your intro is written here.
        Feel free to add or edit your intro message, or send it as is!
      </div>

      <div className="flex justify-center space-x-7">
        <button
          onClick={() => props.closeModal()}
          className="w-full p-1 text-red-700 bg-slate-50 border-2 border-red-700 rounded-md"
        >
          Cancel
        </button>

        <button className="w-full p-1 text-slate-50 bg-red-700 border-2 border-red-700 rounded-md">
          Send Email
        </button>
      </div>
    </div>
  );
}
