import { TextField } from "./TextField";

export default function ConnectModal(): JSX.Element {
  return (
    <div className=" fixed top-20 left-20 justify-center bg-slate-50 h-1/2 w-1/2 content-center flex flex-col p-9 gap-3 font-sans">
      <div className="font-bold text-2xl text-center">
        Send an email to connect!
      </div>

      <div className="text-xs">
        Use the space below to write out a message to Dev and send a connection
        request. We recommend writing a bit about yourself, your schedule, and
        anything else you think would be good to know!
      </div>

      <TextField multiline={true} charLimit={280}>
        {/* add USSER BIO */}
      </TextField>

      <div className="text-xs italic text-slate-400">
        Note: The information you’ve provided in your intro is written here.
        Feel free to add or edit your intro message, or send it as is!
      </div>

      <div className="flex justify-center space-x-7">
        <button className="w-full p-1 text-red-700 bg-slate-50 border-2 border-red-700 rounded-md">
          Cancel
        </button>

        <button className="w-full p-1 text-slate-50 bg-red-700 border-2 border-red-700 rounded-md">
          Send Email
        </button>
      </div>
    </div>
  );
}
