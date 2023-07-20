import React, { Dispatch, SetStateAction } from "react";
import { Type } from "react-toastify/dist/utils";
import styled from "styled-components";

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
  font-style: normal;
  font-weight: 700;
  font-size: 48px;
  line-height: 77px;
  display: flex;
  align-items: center;
  text-align: center;
  color: #f4f4f4;
`;

const MobileHeaderDiv = styled.div`
  display: flex;
  flex-direction: column;
  align-items: left;
  justify-content: space-between;
  background-color: #b12424;
  padding: 10px 20px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.25);
  width: 100%;
`;

const MobileLogo = styled.h1`
  font-family: "Lato", sans-serif;
  font-style: normal;
  font-weight: 900;
  font-size: 32px;
  line-height: 48px;
  display: flex;
  align-items: center;
  text-align: center;
  color: #f4f4f4;
`;

interface HeaderProps {
  isDesktop: Boolean;
  data?: {
    sidebarValue: string;
    setSidebar: (option: HeaderOptions) => void;
  };
}

export type HeaderOptions = "explore" | "requests";

const Header = (props: HeaderProps) => {
  const renderClassName = (sidebarValue: string, sidebarText: string) => {
    if (sidebarValue == "explore" && sidebarText == "explore") {
      if (props.isDesktop) {
        return "underline underline-offset-8 rounded-xl p-4 font-medium text-xl text-white";
      } else {
        return "underline underline-offset-8 rounded-xl pt-3 pr-3 pb-3 font-normal text-sm text-white";
      }
    } else if (sidebarValue == "requests" && sidebarText == "explore") {
      if (props.isDesktop) {
        return "rounded-xl p-4 font-medium text-xl text-white";
      } else {
        return "rounded-xl pt-3 pr-3 pb-3 font-normal text-sm text-white";
      }
    }

    if (sidebarValue == "requests" && sidebarText == "requests") {
      if (props.isDesktop) {
        return "underline underline-offset-8 rounded-xl p-4 font-medium text-xl text-white";
      } else {
        return "underline underline-offset-8 rounded-xl p-3 font-normal text-sm text-white";
      }
    } else if (sidebarValue == "explore" && sidebarText == "requests") {
      if (props.isDesktop) {
        return "rounded-xl p-4 font-medium text-xl text-white";
      } else {
        return "rounded-xl p-3 font-normal text-sm text-white";
      }
    }
  };

  const renderSidebarOptions = ({
    sidebarValue,
    setSidebar,
  }: {
    sidebarValue: string;
    setSidebar: (option: HeaderOptions) => void;
  }) => {
    return (
      <div className={props.isDesktop ? "pr-12" : ""}>
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
      </div>
    );
  };

  const renderDesktopHeader = (): JSX.Element => {
    return (
      <HeaderDiv>
        <Logo>CarPool</Logo>
        {props.data && renderSidebarOptions(props.data)}
      </HeaderDiv>
    );
  };

  const renderMobileHeader = (): JSX.Element => {
    return (
      <MobileHeaderDiv>
        <MobileLogo>CarPool</MobileLogo>
        {props.data && renderSidebarOptions(props.data)}
      </MobileHeaderDiv>
    );
  };

  return <>{props.isDesktop ? renderDesktopHeader() : renderMobileHeader()}</>;
};

export default Header;
