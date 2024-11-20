import styled from "styled-components";

/**
 * Media queries are min-width 1440, 834, and 420.
 */

export const CompleteProfileButton = styled.button`
  background: #c8102e;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  border-radius: 10px;
  font-family: "Montserrat", sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 20px;
  text-align: center;
  color: #ffffff;
  padding: 5px 7px 5px 7px;
  width: 100%;
  align-self: flex-end;
  @media (min-width: 834px) {
    justify-self: flex-end;
    margin: 1rem 0 1rem 0;
  }
`;

export const ProfileContainer = styled.form`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex: 1 1 auto;
  width: 100%;
  padding: 1.25rem;

  @media (min-width: 834px) {
    flex-direction: row;
  }
`;

export const ProfileColumn = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 0.09rem 0 0.09rem;
  width: 100%;
  flex: 1 1 auto;
  gap: 6px;
`;

export const MiddleProfileSection = styled(ProfileColumn)`
  width: 100%;
  flex: 1 1 auto;
`;

export const BottomProfileSection = styled(ProfileColumn)`
  width: 100%;
  flex: 1 1 auto;
`;

export const TopProfileSection = styled(ProfileColumn)`
  width: 100%;
  padding: 0 0 1rem 0;
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
    padding-top: 0;
    padding-bottom: 0;
  }
  padding-top: 12px;
  padding-bottom: 12px;
`;

export const CommutingScheduleSection = styled(ProfileColumn)`
  width: 100%;
  flex: 1 1 auto;
  gap: 6px;
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
  font-family: "Montserrat", sans-serif;
  font-style: normal;
  font-weight: 300;
  font-size: 0.75rem;
  line-height: 1rem;
  color: gray;
`;

export const ErrorDisplay = styled.span<{}>`
  font-family: "Montserrat", sans-serif;
  font-style: normal;
  max-width: 100%;
  font-weight: 400;
  font-size: 16px;
  line-height: 19px;
  color: #b12424;
`;

export const LightEntryLabel = styled.label<{
  error?: boolean;
}>`
  font-family: "Montserrat", sans-serif;
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
