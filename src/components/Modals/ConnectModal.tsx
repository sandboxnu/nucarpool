import { Dialog } from "@headlessui/react";
import React, { useState } from "react";
import { useToasts } from "react-toast-notifications";
import { EnhancedPublicUser, User } from "../../utils/types";
import { toast } from "react-toastify";
import { BaseEmailSchema } from "../../utils/email";
import { trpc } from "../../utils/trpc";
import Image from "next/image";
import StartIcon from "../../../public/start.png";
import EndIcon from "../../../public/end.png";
import Checkbox from "@mui/material/Checkbox";
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
  const [customMessage, setCustomMessage] = useState(props.user.bio ?? "");
  const { profileImageUrl, imageLoadError } = useProfileImage(
    props.otherUser.id
  );
  const onClose = (action: string) => {
    setIsOpen(false);
    props.onClose(action);
  };
  const handleViewRequest = () => {
    props.onViewRequest(props.otherUser.id);
    props.onClose("connect");
  };

  const utils = trpc.useContext();
  const { mutate: createRequests } = trpc.user.requests.create.useMutation({
    onError: (error: any) => {
      toast.error(`Something went wrong: ${error.message}`);
    },
    async onSuccess() {
      utils.user.recommendations.me.invalidate();
      utils.user.requests.me.invalidate();
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
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="relative flex h-4/6 w-5/6 select-none flex-col content-center justify-center gap-4 overflow-auto rounded-md bg-white p-9 shadow-md sm:h-4/6 sm:w-4/6 md:h-3/6 md:w-3/6">
            {!requestSent ? (
              <>
                <div className="relative flex w-full">
                  <div className="flex w-full flex-row gap-4">
                    <div className="inline-block h-24 ">
                      {profileImageUrl && !imageLoadError ? (
                        <Image
                          src={profileImageUrl}
                          alt={`${props.otherUser.preferredName}'s Profile Image`}
                          width={96}
                          height={96}
                          className="inline-block h-24 w-24 rounded-full object-fill"
                        />
                      ) : (
                        <AiOutlineUser className="h-24 w-24 rounded-full  bg-gray-200" />
                      )}
                    </div>
                    <div className="flex w-full flex-col justify-center gap-2 pl-3.5">
                      <div className="flex w-full flex-row items-baseline justify-start gap-2 ">
                        <div className="text-lg font-bold lg:text-xl ">
                          <p>{props.otherUser.preferredName}</p>
                        </div>
                        <p className="font-montserrat  text-sm  italic">
                          {props.otherUser.pronouns !== ""
                            ? "(" + `${props.otherUser.pronouns}` + ")"
                            : null}
                        </p>
                      </div>

                      {props.otherUser.coopStartDate &&
                        props.otherUser.coopEndDate && (
                          <div className=" flex w-full justify-start align-middle">
                            <div className="flex text-sm ">
                              <p className="pr-1">From:</p>
                              <p className="font-semibold">
                                {dayjs(props.otherUser.coopStartDate).format(
                                  "MMMM"
                                )}
                              </p>
                              <p className="px-2 font-semibold">|</p>
                              <p className="pr-1">To:</p>
                              <p className="font-semibold">
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
                <div className="relative flex w-full flex-row justify-evenly gap-4">
                  <div className="flex flex-col  gap-2">
                    <div className="text-lg font-bold">About:</div>
                    <div className="">{props.otherUser.bio}</div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {/*start location*/}
                    <div className="flex  items-center">
                      <div className="flex w-7 items-center justify-center">
                        <Image
                          src={StartIcon}
                          width={25}
                          height={25}
                          alt="Start icon"
                        />
                      </div>
                      <p className="ml-2 text-sm font-semibold">
                        {props.otherUser.startPOILocation}
                      </p>
                    </div>

                    {/*End location*/}
                    <div className="flex items-center">
                      <div className="flex w-7 items-center justify-center">
                        <Image
                          src={EndIcon}
                          width={21}
                          height={25}
                          alt="End icon"
                        />
                      </div>
                      <p className="ml-2 text-sm font-semibold">
                        {props.otherUser.companyName}
                      </p>
                    </div>
                    <div className="flex w-full items-center gap-4">
                      <div className="flex justify-between ">
                        {daysOfWeek.map((day, index) => (
                          <StaticDayBox
                            className="!h-8 !w-8 !text-base"
                            key={index + day}
                            day={day}
                            isSelected={daysArray[index]}
                          />
                        ))}
                      </div>
                    </div>
                    {/* Start and end times */}

                    <div className=" flex w-full justify-between align-middle">
                      <div className="flex text-sm ">
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
                      <div className="flex flex-row text-sm">
                        <div className="mr-1">Seats Available:</div>
                        <div className="font-semibold">
                          {props.otherUser.seatAvail}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="h-0.5 w-full bg-gray-300"> </div>

                <Dialog.Title className="text-center text-2xl font-bold">
                  Send a message to connect!
                </Dialog.Title>
                <div className="text-sm">
                  Use the space below to write out a message to&nbsp;
                  {props.otherUser.preferredName} with any details you want them
                  to know about your request. We&apos;ll also connect you via
                  email.
                </div>
                <textarea
                  className="form-input h-24  w-full  rounded-md px-3 py-2 shadow-sm"
                  maxLength={255}
                  defaultValue={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                ></textarea>
                <div className="flex justify-center space-x-7">
                  <button
                    onClick={() => onClose("close")}
                    className="w-full rounded-md border-2 border-red-700 bg-slate-50 p-1 text-red-700"
                  >
                    Cancel
                  </button>
                  <button
                    className="w-full rounded-md border-2 border-red-700 bg-red-700 p-1 text-slate-50"
                    onClick={handleOnClick}
                  >
                    Send Message
                  </button>
                </div>
              </>
            ) : (
              <>
                <Dialog.Title className="text-center text-2xl font-bold">
                  Your request has been sent!
                </Dialog.Title>
                <div className="text-center">
                  Click below to view or continue exploring.
                </div>
                <div className="flex justify-center space-x-7">
                  <button
                    onClick={() => onClose("close")}
                    className="w-full rounded-md border-2 border-red-700 bg-slate-50 p-1 text-red-700"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleViewRequest}
                    className="w-full rounded-md border-2 border-red-700 bg-red-700 p-1 text-slate-50"
                  >
                    View Request
                  </button>
                </div>
              </>
            )}
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
};

export default ConnectModal;
