import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { AddToSiteProductModalContent } from "./AddToSiteProductModalContent";
import { AlertDialog, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DeleteProductAlertDialogContent } from "./DeleteProductAlertDialogContent";

export function ServerGrid({
  servers,
}: {
  servers: {
    _id: string;
    name: string;
    url: string;
    cancel_at_period_end: boolean;
  }[];
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {servers.map((server) => (
        <ServerCard key={server._id.toString()} {...server} />
      ))}
    </div>
  );
}

export function ServerCard({
  _id,
  name,
  url,
  cancel_at_period_end,
}: {
  _id: string;
  name: string;
  url: string;
  cancel_at_period_end: boolean;
}) {
  const serverCanceled = cancel_at_period_end;

  return (
    <Card>
      <CardHeader>
        <div className="flex gap-2 justify-between items-end">
          <CardTitle>
            <Link href={`/dashboard/products/${_id}/edit`}>{name}</Link>
          </CardTitle>
          <Dialog>
            <AlertDialog>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="size-8 p-0">
                    <div className="sr-only">Action Menu</div>
                    <DotsHorizontalIcon className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DialogTrigger asChild>
                    <DropdownMenuItem>View Server</DropdownMenuItem>
                  </DialogTrigger>
                  <DropdownMenuItem asChild disabled={serverCanceled && true}>
                    <Link href={`/dashboard/servers/${_id}/edit`}>
                      Edit Server
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem disabled={serverCanceled && true}>
                      {serverCanceled
                        ? "Subscription Canceled"
                        : "Cancel Subscription"}
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                </DropdownMenuContent>
              </DropdownMenu>
              <DeleteProductAlertDialogContent _id={_id} />
            </AlertDialog>
            <AddToSiteProductModalContent _id={_id} />
          </Dialog>
        </div>
        <CardDescription className="overflow-hidden">
          <Link href={url}>{url}</Link>
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
