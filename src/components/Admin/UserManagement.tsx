import { Permission } from "@prisma/client";
import { trpc } from "../../utils/trpc";
import React, { useEffect, useState } from "react";
import Spinner from "../Spinner";
import { toast } from "react-toastify";
import { ConfigProvider, Select } from "antd";
import { Note } from "../../styles/profile";
import { TempUser } from "../../utils/types";

type UserManagementProps = {
  permission: Permission;
};
const UserManagement = ({ permission }: UserManagementProps) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedUser, setSelectedUser] = React.useState<TempUser | null>(null);
  const [selectedPermission, setSelectedPermission] =
    React.useState<Permission | null>(null);
  const { data: users } = trpc.user.admin.getAllUsers.useQuery<TempUser[]>();
  const utils = trpc.useUtils();

  const updateUserPermission = trpc.user.admin.updateUserPermission.useMutation(
    {
      onSuccess: () => {
        toast.success("User permission updated successfully!");
        utils.user.admin.getAllUsers.refetch();
      },
      onError: (error) => {
        toast.error(`Failed to update permission: ${error.message}`);
      },
    }
  );
  useEffect(() => {
    if (users) {
      setLoading(false);
    }
  }, [users]);
  const handleUserChange = (value: string) => {
    const user = users?.find((user) => user.id === value);
    if (user) {
      setSelectedUser(user);
      setSelectedPermission(user.permission);
    }
  };
  const updatePermission = () => {
    if (selectedUser && selectedPermission) {
      updateUserPermission.mutate({
        userId: selectedUser.id,
        permission: selectedPermission,
      });
    } else {
      toast.error("User or Permission not selected");
    }
  };
  const groupedOptions = users
    ? [
        {
          label: "Managers",
          options: users
            .filter((user) => user.permission === "MANAGER")
            .map((user) => ({ label: user.email, value: user.id })),
        },
        {
          label: "Admins",
          options: users
            .filter((user) => user.permission === "ADMIN")
            .map((user) => ({ label: user.email, value: user.id })),
        },
        {
          label: "Users",
          options: users
            .filter((user) => user.permission === "USER")
            .map((user) => ({ label: user.email, value: user.id })),
        },
      ]
    : [];

  return (
    <div className="relative h-full w-full">
      {loading && <Spinner />}
      {!loading && users && (
        <div className="m-auto p-20 ">
          <div className="flex flex-col gap-10 p-10 ">
            <h1 className="text-center font-montserrat text-3xl font-bold text-black">
              Permissions Management
            </h1>
            {permission !== "MANAGER" && (
              <div className="items-center gap-1 text-center">
                <Note>
                  Admins can view user permissions but cannot modify them.
                </Note>
                <Note>
                  To change your permission, contact a MANAGER from the
                  dropdown.
                </Note>
              </div>
            )}
            <div className="flex flex-row items-center justify-center gap-8">
              <ConfigProvider
                theme={{
                  token: {
                    fontFamily: "Lato",
                    fontSize: 16,
                    colorPrimary: "#C8102E",
                  },
                }}
              >
                <Select
                  showSearch
                  style={{ width: "180px" }}
                  placeholder={
                    permission === "MANAGER"
                      ? "Select a User"
                      : "View User List"
                  }
                  onChange={handleUserChange}
                  popupMatchSelectWidth={false}
                  placement={"bottomRight"}
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  options={groupedOptions}
                />
                <Select
                  placeholder="Change Permission"
                  value={selectedPermission}
                  disabled={permission !== "MANAGER"}
                  onChange={(value: Permission) => {
                    setSelectedPermission(value);
                  }}
                  popupMatchSelectWidth={false}
                  placement={"bottomLeft"}
                  options={[
                    { value: "USER", label: "user" },
                    { value: "ADMIN", label: "admin" },
                    { value: "MANAGER", label: "manager" },
                  ]}
                />
              </ConfigProvider>
            </div>
            {permission === "MANAGER" && (
              <button
                className="text-bold w-full justify-center rounded-2xl bg-northeastern-red py-2 font-lato text-white hover:bg-busy-red "
                onClick={updatePermission}
              >
                Update Permission
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default UserManagement;
