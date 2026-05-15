import React, { useState } from "react";
import { EnhancedPublicUser, PublicUser, User } from "../../utils/types";
import { SidebarContent } from "./SidebarContent";
import CustomSelect from "./CustomSelect";
interface RequestSidebarProps {
  received: EnhancedPublicUser[];
  sent: EnhancedPublicUser[];
  viewRoute: (user: User, otherUser: PublicUser) => void;
  disabled: boolean;
  onUserSelect: (userId: string) => void;
  selectedUser: EnhancedPublicUser | null;
}
interface Option<T> {
  value: T;
  label: string;
}
const RequestSidebar = (props: RequestSidebarProps) => {
  const [curOption, setCurOption] = useState<"received" | "sent" | "all">(
    "all",
  );
  const options: Option<"received" | "sent" | "all">[] = [
    { value: "all", label: "All" },
    { value: "received", label: "Received" },
    { value: "sent", label: "Sent" },
  ];
  const handleCardClick = (userId: string) => {
    props.onUserSelect(userId);
  };
  return (
    <div className="z-10 flex h-full flex-shrink-0 flex-col bg-white text-left">
      <div className="flex-row px-7 pb-4 pt-7">
        <div className="flex items-center justify-between ">
          <div className="text-2xl font-semibold ">Requests</div>
          <CustomSelect
            className="!w-2/5 "
            value={curOption}
            onChange={setCurOption}
            options={options}
          />
        </div>
      </div>
      <SidebarContent
        userCardList={
          curOption === "all"
            ? [...props.received, ...props.sent]
            : curOption === "sent"
              ? props.sent
              : props.received
        }
        subType={curOption}
        disabled={props.disabled}
        onViewRouteClick={props.viewRoute}
        onCardClick={handleCardClick}
        selectedUser={props.selectedUser}
        onViewRequest={props.onUserSelect}
      />
    </div>
  );
};

export default RequestSidebar;
