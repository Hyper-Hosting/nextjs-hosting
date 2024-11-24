// import { getProducts } from "@/server/db/products";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { ArrowRightIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
// import { HasPermission } from "@/components/HasPermission";
// import { canAccessAnalytics } from "@/server/permissions";
// import {
//   CHART_INTERVALS,
//   getViewsByDayChartData,
// } from "@/server/db/productViews";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { ViewsByDayChart } from "./_components/charts/ViewsByDayChart";
import { getServers } from "@/server/db/servers";
import { NoServers } from "./_components/NoServers";
import { ServerGrid } from "./_components/ServerGrid";

export default async function DashboardPage() {
  const { userId, redirectToSignIn } = await auth();
  if (userId == null) return redirectToSignIn();

  const servers = await getServers(userId, { limit: 6 });
  if (servers.length === 0) return <NoServers />;

  return (
    <>
      <h2 className="mb-6 text-3xl font-semibold flex justify-between">
        <Link
          className="group flex gap-2 items-center hover:underline"
          href="/dashboard/servers"
        >
          Servers
          <ArrowRightIcon className="group-hover:translate-x-1 transition-transform" />
        </Link>
        <Button asChild>
          <Link href="/dashboard/servers/new">
            <PlusIcon className="size-4 mr-2" />
            New Server
          </Link>
        </Button>
      </h2>
      <ServerGrid servers={servers} />

      {/* <h2 className="mb-6 text-3xl font-semibold flex justify-between mt-12">
        <Link
          className="group flex gap-2 items-center hover:underline"
          href="/dashboard/analytics"
        >
          Analytics
          <ArrowRightIcon className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </h2>
      <HasPermission permission={canAccessAnalytics} renderFallback>
        <h1>hu</h1>
        <AnalyticsChart userId={userId} />
      </HasPermission> */}
    </>
  );
}

//async function AnalyticsChart({ userId }: { userId: string }) {
  // const chartData = await getViewsByDayChartData({
  //   userId,
  //   interval: CHART_INTERVALS.last30Days,
  //   timezone: "UTC",
  // });

//  return (
//    <Card>
//      <CardHeader>
//        <CardTitle>Views by Day</CardTitle>
//      </CardHeader>
//      <CardContent>
//        {/* <ViewsByDayChart chartData={chartData} /> */}
//      </CardContent>
//    </Card>
//  );
//}
