import React, { Dispatch, SetStateAction, useContext, useState } from "react";
import styled from "styled-components";
import DropDownMenu from "./DropDownMenu";
import { createPortal } from "react-dom";
import { GroupPage } from "./GroupPage";

const HeaderDiv = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  background-color: #b12424;
  padding: 0 40px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.25);
  height: 8.5%;
  width: 100%;
`;

const Logo = styled.h1`
  font-family: "Lato", sans-serif;
  height: 111px;
  font-style: normal;
  font-weight: 700;
  font-size: 48px;
  line-height: 77px;
  display: flex;
  align-items: center;
  text-align: center;
  color: #f4f4f4;
`;

interface HeaderProps {
  data?: {
    sidebarValue: string;
    setSidebar: Dispatch<SetStateAction<HeaderOptions>>;
  };
}

export type HeaderOptions = "explore" | "requests";

const Header = (props: HeaderProps) => {
  const [displayGroup, setDisplayGroup] = useState<boolean>(false);
  const renderClassName = (sidebarValue: string, sidebarText: string) => {
    if (sidebarValue == "explore" && sidebarText == "explore") {
      return "underline underline-offset-8 rounded-xl p-4 font-medium text-xl text-white";
    } else if (sidebarValue == "requests" && sidebarText == "explore") {
      return "rounded-xl p-4 font-medium text-xl text-white";
    }

    if (sidebarValue == "requests" && sidebarText == "requests") {
      return "underline underline-offset-8 rounded-xl p-4 font-medium text-xl text-white";
    } else if (sidebarValue == "explore" && sidebarText == "requests") {
      return "rounded-xl p-4 font-medium text-xl text-white";
    }

    if (displayGroup) {
      return "underline underline-offset-8 rounded-xl p-4 font-medium text-xl text-white";
    } else {
      return "rounded-xl p-4 font-medium text-xl text-white";
    }
  };

  const renderSidebarOptions = ({
    sidebarValue,
    setSidebar,
  }: {
    sidebarValue: string;
    setSidebar: Dispatch<SetStateAction<HeaderOptions>>;
  }) => {
    return (
      <div className="pr-12">
        <button
          onClick={() => {
            setSidebar("explore");
          }}
          className={renderClassName(sidebarValue, "explore")}
        >
          Explore
        </button>
        <button
          onClick={() => {
            setSidebar("requests");
          }}
          className={renderClassName(sidebarValue, "requests")}
        >
          Requests
        </button>
        <button
          onClick={() => setDisplayGroup(true)}
          className={renderClassName(sidebarValue, "filler")}
        >
          My Group
        </button>
      </div>
    );
  };

  return (
    <HeaderDiv>
      <Logo>CarpoolNU</Logo>
      {props.data && (
        <div className="flex items-center">
          {renderSidebarOptions(props.data)}
          <DropDownMenu />
          <>
            {displayGroup &&
              createPortal(
                <GroupPage onClose={() => setDisplayGroup(false)} />,
                document.body
              )}
          </>
        </div>
      )}
    </HeaderDiv>
  );
};

export default Header;
