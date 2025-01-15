import { Dialog } from "@headlessui/react";
import React, { useState } from "react";
import { useToasts } from "react-toast-notifications";
import { EnhancedPublicUser, User } from "../../utils/types";
import { toast } from "react-toastify";
import { trpc } from "../../utils/trpc";
import Image from "next/image";
import StartIcon from "../../../public/start.png";
import EndIcon from "../../../public/end.png";
import StaticDayBox from "../Sidebar/StaticDayBox";
import dayjs from "dayjs";
import useProfileImage from "../../utils/useProfileImage";
import { AiOutlineUser } from "react-icons/ai";

interface ConnectModalProps {
  user: User;
  otherUser: EnhancedPublicUser;
  onClose: (action: string) => void;
  onViewRequest: (userId: string) => void;
}

const ConnectModal = (props: ConnectModalProps): JSX.Element => {
  const { addToast } = useToasts();
  const [isOpen, setIsOpen] = useState(true);
  const [requestSent, setRequestSent] = useState(false);
  const [customMessage, setCustomMessage] = useState("");
  const { profileImageUrl, imageLoadError } = useProfileImage(
    props.otherUser.id
  );
  const onClose = async (action: string) => {
    if (action === "closeAfterSend") {
      await utils.user.recommendations.me.invalidate();
      await utils.user.requests.me.invalidate();
    }
    setIsOpen(false);
    props.onClose(action);
  };
  const handleViewRequest = async () => {
    await utils.user.recommendations.me.invalidate();
    await utils.user.requests.me.invalidate();
    props.onViewRequest(props.otherUser.id);
    props.onClose("connect");
  };

  const utils = trpc.useContext();
  const { mutate: createRequests } = trpc.user.requests.create.useMutation({
    onError: (error: any) => {
      toast.error(`Something went wrong: ${error.message}`);
    },
    async onSuccess() {
      setRequestSent(true);
    },
  });
  const { mutate: sendConnectEmail } =
    trpc.user.emails.sendRequestNotification.useMutation({
      onError: (error: any) => {
        toast.error(`Something went wrong: ${error.message}`);
      },
      onSuccess: () => {
        console.log("Email sent successfully");
      },
    });

  const handleOnClick = () => {
    if (props.user.email && props.otherUser.email) {
      sendConnectEmail({
        senderName: props.user.preferredName,
        senderEmail: props.user.email,
        receiverName: props.otherUser.preferredName,
        receiverEmail: props.otherUser.email,
        isDriver: props.otherUser.role === "DRIVER",
        messagePreview: customMessage,
      });
      createRequests({
        fromId: props.user.id,
        toId: props.otherUser.id,
        message: customMessage,
      });
      addToast(
        "A request to carpool has been sent to " +
          props.otherUser.preferredName,
        { appearance: "success" }
      );
    }
  };
  const daysOfWeek = ["Su", "M", "Tu", "W", "Th", "F", "S"];
  const daysArray = props.otherUser.daysWorking
    .split(",")
    .map((day) => day === "1");
  return (
    <Dialog
      open={isOpen}
      onClose={() => onClose("close")}
      className="relative z-50"
    >
      <div className="fixed inset-0 font-montserrat  backdrop-blur-sm">
        <div className="fixed inset-0 flex items-center justify-center ">
          <Dialog.Panel className="absolute  flex  w-5/6 max-w-[700px] select-none flex-col content-center  justify-center gap-4 overflow-y-auto overflow-x-hidden rounded-2xl bg-white py-4  shadow-md  md:aspect-square ">
            {!requestSent ? (
              <>
                <div className="relative  flex w-full">
                  <div className="flex w-full flex-row gap-4  px-6 md:px-12">
                    <div className="relative inline-block h-28 w-28">
                      {profileImageUrl && !imageLoadError ? (
                        <Image
                          src={profileImageUrl}
                          alt={`${props.otherUser.preferredName}'s Profile Image`}
                          width={112}
                          height={112}
                          layout="fixed"
                          className="rounded-full"
                        />
                      ) : (
                        <AiOutlineUser className="h-28 w-28 rounded-full bg-gray-200 p-2" />
                      )}
                    </div>
                    <div className="flex w-full flex-col justify-center gap-2 pl-4">
                      <div className="flex flex-row items-baseline justify-start gap-2 ">
                        <div className="text-lg font-bold lg:text-xl ">
                          <p>{props.otherUser.preferredName}</p>
                        </div>
                        <p className="font-montserrat  text-sm italic text-stone-400">
                          {props.otherUser.pronouns !== ""
                            ? "(" + `${props.otherUser.pronouns}` + ")"
                            : null}
                        </p>
                      </div>

                      {props.otherUser.coopStartDate &&
                        props.otherUser.coopEndDate && (
                          <div className=" flex  justify-start align-middle">
                            <div className="flex text-base ">
                              <p className="pr-1">From:</p>
                              <p className="font-bold">
                                {dayjs(props.otherUser.coopStartDate).format(
                                  "MMMM"
                                )}
                              </p>
                              <p className="px-2  ">|</p>
                              <p className="pr-1">To:</p>
                              <p className="font-bold">
                                {dayjs(props.otherUser.coopEndDate).format(
                                  "MMMM"
                                )}
                              </p>
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                </div>
                <div className="relative flex w-full flex-col justify-evenly   divide-y divide-[#EAEAEA] border-y border-[#EAEAEA] md:flex-row md:divide-x ">
                  {props.otherUser.bio !== "" && (
                    <div className="flex flex-col gap-2 px-12 py-7 md:w-1/2">
                      <div className="mb-2 text-lg font-bold">About:</div>
                      <div className="wrap text-base">
                        {props.otherUser.bio}
                      </div>
                    </div>
                  )}
                  <div className="flex flex-col gap-3 py-7 pl-12 md:w-1/2">
                    {/*start location*/}
                    <div className="flex  items-center">
                      <div className="flex w-8 items-center justify-center">
                        <Image
                          src={StartIcon}
                          width={30}
                          height={30}
                          alt="Start icon"
                        />
                      </div>
                      <p className="ml-1.5  font-semibold">
                        {props.otherUser.startAddress}
                      </p>
                    </div>

                    {/*End location*/}
                    <div className="flex items-center">
                      <div className="flex w-8 items-center justify-center">
                        <Image
                          src={EndIcon}
                          width={21}
                          height={25}
                          alt="End icon"
                        />
                      </div>
                      <p className="ml-1.5 font-semibold">
                        {props.otherUser.companyName}
                      </p>
                    </div>
                    <div className="flex w-full items-center ">
                      {daysOfWeek.map((day, index) => (
                        <StaticDayBox
                          className="!m-0.5 !h-7 !w-7 !text-base"
                          key={index + day}
                          day={day}
                          isSelected={daysArray[index]}
                        />
                      ))}
                    </div>
                    {/* Start and end times */}

                    <div className="flex w-full justify-between align-middle">
                      <div className="flex  ">
                        <p className="pr-1">Start:</p>
                        <p className="font-semibold">
                          {dayjs
                            .tz(props.otherUser.startTime, "UTC")
                            .format("h:mm")}{" "}
                          am
                        </p>
                        <p className="px-2 font-semibold">|</p>
                        <p className="pr-1">End:</p>
                        <p className="font-semibold">
                          {dayjs
                            .tz(props.otherUser.endTime, "UTC")
                            .format("h:mm")}{" "}
                          pm
                        </p>
                      </div>
                    </div>
                    {props.otherUser.role === "DRIVER" && (
                      <div className="flex flex-row">
                        <div className="mr-1">Seats Available:</div>
                        <div className="font-semibold">
                          {props.otherUser.seatAvail}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex w-full flex-col px-14">
                  <Dialog.Title className="mb-4 pt-2 text-center text-xl font-bold">
                    Send a message to connect!
                  </Dialog.Title>
                  <p className="mb-3 text-[12px] text-stone-600">
                    Use the space below to write out a message to&nbsp;
                    {props.otherUser.preferredName} with any details you want
                    them to know about your request. We&apos;ll also connect you
                    via email.
                  </p>
                  <textarea
                    className="form-input mb-2 flex max-h-32 min-h-16 w-full rounded-lg  border border-stone-400 px-6   shadow-sm"
                    maxLength={250}
                    defaultValue={customMessage}
                    placeholder={"Send a message"}
                    onChange={(e) => setCustomMessage(e.target.value)}
                  ></textarea>
                  <div className=" mb-1 h-6 w-full text-sm text-stone-400">
                    <div className="text-end ">{customMessage.length}/250</div>
                  </div>
                  <div className="flex w-full  justify-center space-x-7">
                    <div className="flex w-full justify-center gap-6 md:w-3/4">
                      <button
                        onClick={() => onClose("close")}
                        className="w-full rounded-md border border-black p-1  hover:bg-stone-100 "
                      >
                        Cancel
                      </button>
                      <button
                        className="w-full rounded-md  bg-northeastern-red p-1 text-slate-50 hover:bg-red-700"
                        onClick={handleOnClick}
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col justify-center  ">
                <Dialog.Title className="mb-8 text-center text-2xl font-bold">
                  Your request has been sent!
                </Dialog.Title>
                <div className="mb-4 text-center">
                  Click below to view or continue exploring.
                </div>
                <div className="flex w-full  justify-center space-x-7">
                  <div className="flex w-full  gap-6 md:w-3/4">
                    <button
                      onClick={() => onClose("closeAfterSend")}
                      className="w-full rounded-md border border-black p-1  hover:bg-stone-100 "
                    >
                      Close
                    </button>
                    <button
                      className="w-full rounded-md  bg-northeastern-red p-1 text-slate-50 hover:bg-red-700"
                      onClick={handleViewRequest}
                    >
                      View Request
                    </button>
                  </div>
                </div>
              </div>
            )}
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
};

export default ConnectModal;
