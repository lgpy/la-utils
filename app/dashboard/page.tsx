import { MonthlyGrowthChart } from "@/components/Charts/MonthlyGrowthChart";
import { WeeklyGrowthChart } from "@/components/Charts/WeeklyGrowthChart";
import UserList from "@/components/UserList";
import { auth } from "@/lib/auth.server";
import { client } from "@/lib/orpc";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/');
  }

  const ManagementPermission = await auth.api.userHasPermission({
    body: {
      userId: session.user.id,
      permissions: {
        dashboard: ["view"],
      },
    }
  })

  if (!ManagementPermission.success) {
    redirect('/');
  }

  const userCount = await client.users.count();
  const userList = await client.users.listUsersInfinite({
    limit: 20,
    cursor: 0
  });

  const graphData = await client.users.graphData();

  return (
    <div className="container py-6">
      <div className="max-w-4xl mx-auto flex flex-col gap-12">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-lg">Total Users: {userCount}</p>
        <div className="flex flex-row gap-4">
          <WeeklyGrowthChart data={graphData.weeklyGrowth} />
          <UserList initialData={userList} />
        </div>
        <MonthlyGrowthChart data={graphData.monthlyGrowth} />
      </div>
    </div>
  );
}
