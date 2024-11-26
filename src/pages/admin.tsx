import { GetServerSidePropsContext, NextPage } from "next";
import { getSession } from "next-auth/react";
import Header from "../components/Header";
import AdminSidebar from "../components/Admin/AdminSidebar";
import { useState } from "react";
import UserManagement from "../components/Admin/UserManagement";
import Spinner from "../components/Spinner";
import { Permission } from "@prisma/client";
import AdminData from "../components/Admin/AdminData";

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getSession(context);

  if (session?.user) {
    if (session.user.permission === "USER") {
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    }
  } else {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {
      userPermission: session.user.permission,
    },
  };
}

interface AdminProps {
  userPermission: Permission;
}

const Admin: NextPage<AdminProps> = ({ userPermission }) => {
  const [option, setOption] = useState<string>("management");
  return (
    <div className="relative h-full w-full overflow-hidden  ">
      <Header admin={true} />
      {!userPermission ? (
        <Spinner />
      ) : (
        <div className="flex h-[91.5%]  flex-row">
          <div className="z-0 min-w-[150px] max-w-[250px] flex-[1] border-r-4 border-busy-red   bg-stone-100">
            <AdminSidebar option={option} setOption={setOption} />
          </div>
          <div className="flex-[3]">
            {option === "management" ? (
              <UserManagement permission={userPermission} />
            ) : (
              <AdminData />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default Admin;
