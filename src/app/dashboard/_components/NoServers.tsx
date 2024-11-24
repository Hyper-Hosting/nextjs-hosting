import { Button } from "@/components/ui/button";
import Link from "next/link";

export function NoServers() {
  return (
    <div className="mt-32 text-center text-balance">
      <h1 className="text-4xl font-semibold mb-2">You have no servers</h1>
      <p className="mb-4">
        Get started with Hyper Hosting by creating a server
      </p>
      <Button size="lg" asChild>
        <Link href="/dashboard/servers/new">Add Server</Link>
      </Button>
    </div>
  );
}
