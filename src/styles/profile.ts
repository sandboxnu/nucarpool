import styled from "styled-components";

export const ProfileColumn = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 0.09rem 0 0.09rem;
  width: 100%;
  flex: 1 1 auto;
  gap: 6px;
`;

styled(ProfileColumn)`
  width: 100%;
  flex: 1 1 auto;
`;

styled(ProfileColumn)`
  width: 100%;
  flex: 1 1 auto;
`;

styled(ProfileColumn)`
  width: 100%;
  padding: 0 0 1rem 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  flex: 0 1 auto;
`;

styled(ProfileColumn)`
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

styled(ProfileColumn)`
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

styled(ProfileHeader)`
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
