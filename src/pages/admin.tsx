import { GetServerSidePropsContext, NextPage } from "next";
import { getSession } from "next-auth/react";
import Header from "../components/Header";
import AdminSidebar from "../components/Admin/AdminSidebar";
import { useState } from "react";
import UserManagement from "../components/Admin/UserManagement";

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
  }

  return {
    props: {},
  };
}

const Admin: NextPage = () => {
  const [option, setOption] = useState<string>("management");
  return (
    <div className="relative h-full max-h-screen w-full ">
      <Header admin={true} />
      <div className="flex h-full  flex-row">
        <div className="z-0 min-w-[150px] max-w-[250px] flex-[1] border-r-4 border-busy-red   bg-stone-100">
          <AdminSidebar option={option} setOption={setOption} />
        </div>
        <div className="flex-[3]">
          {option === "management" && <UserManagement />}
        </div>
      </div>
    </div>
  );
};
export default Admin;
