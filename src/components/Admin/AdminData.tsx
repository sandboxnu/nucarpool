import React, { useEffect, useState } from "react";
import Spinner from "../Spinner";
import { trpc } from "../../utils/trpc";
import { TempUser, TempGroup } from "../../utils/types";
import BarChartUserCounts from "./BarChartUserCounts";
import LineChartCount from "./LineChartCount";

function AdminData() {
  const [loading, setLoading] = useState<boolean>(true);
  const { data: users = [] } =
    trpc.user.admin.getAllUsers.useQuery<TempUser[]>();
  const { data: groups = [] } =
    trpc.user.admin.getCarpoolGroups.useQuery<TempGroup[]>();

  useEffect(() => {
    if (users && groups) {
      setLoading(false);
    }
  }, [users, groups]);

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="relative my-4 h-[91.5%]  w-full">
      <div className="absolute inset-0 flex h-full flex-col  space-y-6  px-8">
        <div className="min-h-0 flex-[1.5] ">
          <BarChartUserCounts users={users} />
        </div>
        <div className="min-h-0 flex-[2]">
          <LineChartCount users={users} groups={groups} />
        </div>
      </div>
    </div>
  );
}

export default AdminData;
