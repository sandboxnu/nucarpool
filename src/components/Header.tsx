import Image from "next/image";
import React from "react";
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

const PageName = styled.h1`
  height: 64px;
  font-family: "Lato", sans-serif;
  font-style: normal;
  font-weight: 500;
  font-size: 40px;
  line-height: 48px;
  display: flex;
  align-items: center;
  text-align: center;

  color: #f4f4f4;
`;

const Header = () => {
  return (
    <HeaderDiv>
      <Logo>CarPool</Logo>
      <PageName>My Profile</PageName>
    </HeaderDiv>
  );
};

export default Header;
