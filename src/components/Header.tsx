import React, {
  Dispatch,
  SetStateAction,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import styled from "styled-components";
import DropDownMenu from "./DropDownMenu";
import { createPortal } from "react-dom";
import { GroupPage } from "./GroupPage";
import { trpc } from "../utils/trpc";
import { UserContext } from "../utils/userContext";
import { useRouter } from "next/router";
import Spinner from "./Spinner";
import Pusher from "pusher-js";
import { browserEnv } from "../utils/env/browser";
import { Message, PublicUser } from "../utils/types";
import {
  HiOutlineMap,
  HiOutlineChatAlt2,
  HiOutlineUserGroup,
  HiOutlineUser,
} from "react-icons/hi";

const HeaderDiv = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  background-color: #c8102e;
  padding: 0 40px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.25);
  height: 8.5%;
  width: 100%;
  z-index: 10;

  @media (max-width: 768px) {
    padding: 0 20px;
  }
`;

const MobileNav = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: space-around;
  align-items: center;
  background-color: #e6e6e6;
  padding: 0px 0;
  box-shadow: 0px -2px 6px rgba(0, 0, 0, 0.15);
  z-index: 100;
  border-top: 1px solid #d1d1d1;
`;

const MobileNavItem = styled.div<{ active: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 0;
  width: 25%;
  border-bottom: ${(props) =>
    props.active ? "4px solid #000" : "4px solid transparent"};
  cursor: pointer;
`;

export const Logo = styled.h1`
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

  @media (max-width: 768px) {
    font-size: 32px;
    height: 70px;
    line-height: normal;
  }
`;

export const SigninLogo = styled.h1`
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
  justify-content: center;
  width: 100%;

  @media (max-width: 768px) {
    font-size: 32px;
    height: 70px;
    line-height: normal;
  }
`;

interface HeaderProps {
  data?: {
    sidebarValue: string;
    setSidebar: Dispatch<SetStateAction<HeaderOptions>>;
    disabled: boolean;
  };
  admin?: boolean;
  signIn?: boolean;
  profile?: boolean;
  checkChanges?: () => void;
  isMobile?: boolean;
  onViewGroupRoute?: (driver: PublicUser, riders: PublicUser[]) => void;
}

export type HeaderOptions = "explore" | "requests" | "mygroup";

const Header = (props: HeaderProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeNav, setActiveNav] = useState<string>("explore");
  const { data: unreadMessagesCount } =
    trpc.user.messages.getUnreadMessageCount.useQuery();
  const user = useContext(UserContext);
  const router = useRouter();

  const [currentunreadMessagesCount, setCurrentunreadMessagesCount] =
    useState(0);
  const [displayGroup, setDisplayGroup] = useState<boolean>(false);

  // Check if we're explicitly passed isMobile or detect it ourselves
  const [internalIsMobile, setInternalIsMobile] = useState(false);
  const isMobile =
    props.isMobile !== undefined ? props.isMobile : internalIsMobile;

  // Track if user is coming from profile page
  const isComingFromProfile = useRef(false);

  // Only run our own detection if isMobile isn't passed as a prop
  useEffect(() => {
    if (props.isMobile !== undefined) return;

    const checkIfMobile = () => {
      setInternalIsMobile(window.innerWidth <= 768);
    };

    // Initial check
    checkIfMobile();

    // Add event listener for window resize
    window.addEventListener("resize", checkIfMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile);
  }, [props.isMobile]);

  useEffect(() => {
    if (!user?.id) return;

    const pusher = new Pusher(browserEnv.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: browserEnv.NEXT_PUBLIC_PUSHER_CLUSTER,
    });

    const messageChannel = pusher.subscribe(`notification-${user?.id}`);

    messageChannel.bind("sendNotification", (data: { newMessage: Message }) => {
      props.data?.setSidebar((prev) => {
        if (prev !== "requests") {
          setCurrentunreadMessagesCount((prev) => prev + 1);
        }
        return prev;
      });
    });

    return () => {
      messageChannel.unbind("sendNotification");
      pusher.unsubscribe(`notification-${user?.id}`);
    };
  }, [props.data?.setSidebar, props.data, user?.id]);

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

  const handleAdminClick = async () => {
    setIsLoading(true);
    if (!props.admin) {
      await router.push("/admin");
      setIsLoading(false);
    } else {
      await router.push("/");
      setIsLoading(false);
    }
  };

  const handleMapClick = async () => {
    // Note if we're on profile
    isComingFromProfile.current = props.profile === true;

    if (props.checkChanges) {
      await props.checkChanges();
    } else {
      // explicit navigation
      setIsLoading(true);
      await router.push("/");
      setIsLoading(false);
    }
  };

  const handleMobileNavClick = (option: string) => {
    setActiveNav(option);

    // Check if coming from profile
    const comingFromProfile = router.pathname.includes("/profile");

    if (option === "explore" || option === "requests" || option === "mygroup") {
      setIsLoading(true);

      if (comingFromProfile) {
        // For real mobile devices, we need to ensure navigation completes
        // before attempting reload
        window.location.href = `/?tab=${option}`;
        // Don't use timeout - let the browser handle the navigation naturally
      } else {
        router
          .push({
            pathname: "/",
            query: { tab: option },
          })
          .finally(() => {
            setIsLoading(false);
            if (props.data?.setSidebar) {
              props.data.setSidebar(option as HeaderOptions);
            }
          });
        if (option === "requests") {
          setCurrentunreadMessagesCount(0);
        }
      }
    } else if (option === "profile") {
      // Note we're going to profile
      isComingFromProfile.current = false;

      setIsLoading(true);
      router.push("/profile").finally(() => {
        setIsLoading(false);
      });
    }
  };

  useEffect(() => {
    const { tab, showGroup } = router.query;

    // Handle showGroup parameter (from profile -> My Group navigation)
    if (showGroup === "true") {
      setDisplayGroup(true);
      // Clean up URL parameter after showing modal
      const { showGroup: _, ...restQuery } = router.query;
      if (Object.keys(restQuery).length > 0) {
        router.replace({ pathname: "/", query: restQuery }, undefined, {
          shallow: true,
        });
      } else {
        router.replace("/", undefined, { shallow: true });
      }
    }

    // Handle tab parameter (explore/requests/mygroup navigation)
    if (
      tab &&
      (tab === "explore" || tab === "requests" || tab === "mygroup") &&
      props.data?.setSidebar
    ) {
      props.data.setSidebar(tab as HeaderOptions);
      setActiveNav(tab as string);
    }
  }, [router.query, props.data?.setSidebar, props.data, router]);

  const renderSidebarOptions = ({
    sidebarValue,
    setSidebar,
    disabled,
  }: {
    sidebarValue: string;
    setSidebar: Dispatch<SetStateAction<HeaderOptions>>;
    disabled: boolean;
  }) => {
    if (isLoading) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white ">
          <Spinner />
        </div>
      );
    }

    const handleSidebarChange = (option: HeaderOptions) => {
      // Check if we're coming from profile page
      const comingFromProfile =
        props.profile === true || router.pathname.includes("/profile");

      if (comingFromProfile) {
        // Simplify navigation from profile page - don't force reload
        window.location.href = `/?tab=${option}`;
      } else {
        setSidebar(option);
        if (option === "requests") {
          setCurrentunreadMessagesCount(0);
        }
      }
    };

    return (
      <div className="pr-8 ">
        <button
          onClick={() => {
            handleSidebarChange("explore");
          }}
          disabled={disabled}
          className={renderClassName(sidebarValue, "explore")}
        >
          Explore
        </button>
        <button
          onClick={() => {
            handleSidebarChange("requests");
          }}
          disabled={disabled}
          className={`${renderClassName(sidebarValue, "requests")} relative`}
        >
          Requests
          {(unreadMessagesCount !== 0 || currentunreadMessagesCount !== 0) && (
            <span className="absolute right-0 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-white">
              <span className="text-xs font-bold text-northeastern-red">
                {currentunreadMessagesCount !== 0
                  ? currentunreadMessagesCount
                  : unreadMessagesCount}
              </span>
            </span>
          )}
        </button>
        <button
          onClick={() => setDisplayGroup(true)}
          disabled={disabled}
          className={renderClassName(sidebarValue, "filler")}
        >
          My Group
        </button>
        {user?.permission !== "USER" && (
          <button
            onClick={handleAdminClick}
            disabled={disabled}
            className={renderClassName(sidebarValue, "filler")}
          >
            Admin
          </button>
        )}
      </div>
    );
  };

  const renderMobileNav = () => {
    const isProfilePage = router.pathname.includes("/profile");

    const currentActiveTab = isProfilePage
      ? "profile"
      : displayGroup
        ? "mygroup"
        : props.data?.sidebarValue || activeNav;

    const navItems = [
      {
        id: "explore",
        icon: <HiOutlineMap />,
        label: "Explore",
      },
      {
        id: "requests",
        icon: <HiOutlineChatAlt2 />,
        label: "Requests",
        badge: unreadMessagesCount !== 0 || currentunreadMessagesCount !== 0,
      },
      {
        id: "mygroup",
        icon: <HiOutlineUserGroup />,
        label: "My Group",
      },
      {
        id: "profile",
        icon: <HiOutlineUser />,
        label: "Profile",
      },
    ];

    return (
      <MobileNav>
        {navItems.map((item) => (
          <MobileNavItem
            key={item.id}
            active={currentActiveTab === item.id}
            onClick={() => {
              handleMobileNavClick(item.id);
            }}
          >
            <div style={{ fontSize: "24px" }}>{item.icon}</div>
            <div style={{ position: "relative" }}>
              {item.badge && (
                <span
                  style={{
                    position: "absolute",
                    top: "-18px",
                    right: "-10px",
                    background: "#c8102e",
                    color: "white",
                    borderRadius: "50%",
                    width: "20px",
                    height: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                  }}
                >
                  {currentunreadMessagesCount !== 0
                    ? currentunreadMessagesCount
                    : unreadMessagesCount}
                </span>
              )}
              <span style={{ fontSize: "12px", fontWeight: "500" }}>
                {item.label}
              </span>
            </div>
          </MobileNavItem>
        ))}
      </MobileNav>
    );
  };

  if (isMobile && !props.signIn) {
    return (
      <>
        {renderMobileNav()}
        {displayGroup &&
          createPortal(
            <GroupPage
              onClose={() => setDisplayGroup(false)}
              onViewGroupRoute={props.onViewGroupRoute!}
            />,
            document.body,
          )}
      </>
    );
  }

  return (
    <>
      <HeaderDiv>
        {props.signIn ? (
          <SigninLogo>CarpoolNU</SigninLogo>
        ) : (
          <Logo onClick={() => router.push("/")} style={{ cursor: "pointer" }}>
            CarpoolNU
          </Logo>
        )}
        {props.admin ? (
          <div className="flex items-center">
            <button
              onClick={handleAdminClick}
              className="rounded-xl pr-10 text-xl font-medium text-white"
            >
              Home
            </button>
            {!props.signIn && <DropDownMenu />}
          </div>
        ) : (
          <div className="flex items-center">
            {props.data && renderSidebarOptions(props.data)}
            {props.profile && (
              <div className="flex">
                <button
                  onClick={handleMapClick}
                  className="rounded-xl pr-10 text-xl font-medium text-white"
                >
                  Map
                </button>
                {user?.permission !== "USER" && (
                  <button
                    onClick={handleAdminClick}
                    className="rounded-xl pr-10 text-xl font-medium text-white"
                  >
                    Admin
                  </button>
                )}
              </div>
            )}
            {!props.signIn && <DropDownMenu />}
          </div>
        )}
      </HeaderDiv>

      {displayGroup &&
        createPortal(
          <GroupPage
            onClose={() => setDisplayGroup(false)}
            onViewGroupRoute={props.onViewGroupRoute!}
          />,
          document.body,
        )}
    </>
  );
};

export default Header;
