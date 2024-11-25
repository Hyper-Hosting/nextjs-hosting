import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { ArrowRightIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getServers } from "@/server/db/servers";
import { NoServers } from "./_components/NoServers";
import { ServerGrid } from "./_components/ServerGrid";
import { getUser } from "@/server/db/users";
import { SetPasswordWarning } from "./_components/SetPasswordWarning";

export default async function DashboardPage() {
  const { userId, redirectToSignIn } = await auth();
  if (userId == null) return redirectToSignIn();

  const servers = await getServers(userId);
  if (servers.length === 0) return <NoServers />;

  const user = await getUser(userId);

  return (
    <>
      {user?.pteroId && (
        <SetPasswordWarning
          pteroId={user.pteroId}
          pteroPasswordSet={user.pteroPasswordSet}
        />
      )}

      <h2 className="mb-6 text-3xl font-semibold flex justify-between">
        Owned Servers
        <Button asChild>
          <Link href="/dashboard/servers/new">
            <PlusIcon className="size-4 mr-2" />
            New Server
          </Link>
        </Button>
      </h2>
      <ServerGrid servers={servers} />
    </>
  );
}
