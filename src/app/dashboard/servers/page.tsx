import { auth } from "@clerk/nextjs/server";
import { NoServers } from "../_components/NoServers";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { ServerGrid } from "../_components/ServerGrid";
import { getServers } from "@/server/db/servers";

export default async function Products() {
  const { userId, redirectToSignIn } = await auth();
  if (userId == null) return redirectToSignIn();

  const servers = await getServers(userId);

  if (servers.length === 0) return <NoServers />;

  return (
    <>
      <h1 className="mb-6 text-3xl font-semibold flex justify-between">
        All Servers
        <Button asChild>
          <Link href="/dashboard/servers/new">
            <PlusIcon className="size-4 mr-2" />
            New Server
          </Link>
        </Button>
      </h1>
      <ServerGrid servers={servers} />
    </>
  );
}
