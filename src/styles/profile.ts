import styled from "styled-components";

/**
 * Media queries are min-width 834, and 420.
 */

export const CompleteProfileButton = styled.button`
  background: #b12424;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  border-radius: 10px;
  font-family: "Montserrat", sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 24px;
  text-align: center;
  color: #ffffff;
  width: 222px;
  align-self: flex-end;
  @media (min-width: 834px) {
    justify-self: flex-end;
    margin: 0px;
  }
`;

export const ProfileContainer = styled.form`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  @media (min-width: 834px) {
    align-items: center;
    height: 100%;
  }

  @media (min-width: 420px) {
    padding: 3.5rem 1rem;
  }

  padding: 1.5rem 0;

  width: 90%;
`;

export const ProfileColumn = styled.div`
  display: flex;
  flex-direction: column;
  @media (min-width: 834px) {
    height: 90%;
    width: 85%;
    gap: 0px;
  }
  padding: 0 0.09rem 0 0.09rem;
  gap: 6px;
`;

export const TopProfileSection = styled(ProfileColumn)`
  width: 100%;
  flex: 1 1 auto;
`;

export const MiddleProfileSection = styled(ProfileColumn)`
  width: 100%;
  flex: 1 1 auto;
  margin-bottom: 24px;
`;

export const BottomProfileSection = styled(ProfileColumn)`
  width: 100%;
  @media (min-width: 834px) {
    padding-bottom: 32px;
  }

  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  flex: 0 1 auto;
`;

export const PersonalInfoSection = styled(ProfileColumn)`
  width: 100%;
  flex: 1 1 auto;
  gap: 4px;
  @media (min-width: 834px) {
    padding-top: 0px;
    padding-bottom: 0px;
  }
  padding-top: 12px;
  padding-bottom: 12px;
`;

export const CommutingScheduleSection = styled(ProfileColumn)`
  width: 100%;
  flex: 1 1 auto;
  @media (min-width: 834px) {
    gap: 0px;
  }
  gap: 6px;
  padding-bottom: 1rem;
`;

export const ProfileHeader = styled.h1`
  display: flex;
  font-family: "Montserrat", sans-serif;
  font-style: normal;
  font-weight: 700;

  line-height: 39px;
  color: #000000;

  @media (min-width: 420px) {
    margin-bottom: 22px;
    font-size: 32px;
  }
  font-size: 24px;
`;

export const ProfileHeaderNoMB = styled(ProfileHeader)`
  margin-bottom: 0;
`;

export const Note = styled.p<{}>`
  font-family: "Montserrat";
  font-style: normal;
  font-weight: 300;
  font-size: 0.75rem;
  line-height: 1rem;
  color: gray;
`;

export const ErrorDisplay = styled.span<{}>`
  font-family: "Montserrat";
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 19px;
  color: #b12424;
`;

export const LightEntryLabel = styled.label<{
  error?: boolean;
}>`
  font-family: "Montserrat";
  font-style: normal;
  font-weight: 400;
  line-height: 24.38px;
  display: flex;
  align-items: center;
  color: ${(props) => (props.error ? "#B12424" : "#000000")};
  @media (min-width: 420px) {
    font-size: 16px;
  }
`;
