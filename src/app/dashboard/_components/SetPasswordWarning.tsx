import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SetPasswordForm } from "./forms/SetPasswordForm";
import { cn } from "@/lib/utils";

export function SetPasswordWarning({
  pteroId,
  pteroPasswordSet,
}: {
  pteroId: string;
  pteroPasswordSet: boolean;
}) {
  const style = pteroPasswordSet ? "border-default" : "border-destructive";

  return (
    <Card className={cn("border-2 bg-destructive-foreground mb-6", style)}>
      <CardHeader>
        <CardTitle className="font-bold text-lg">
          {pteroPasswordSet ? "Change Password" : "Important!"}
        </CardTitle>
        <div className="flex justify-between gap-3 flex-wrap">
          <CardDescription>
            {pteroPasswordSet
              ? "If you have forgot your password for the pterodactyl panel then you can reset it here:"
              : "You need to set your password for the pterodactyl panel"}
          </CardDescription>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant={pteroPasswordSet ? "outline" : "destructive"}>
                {pteroPasswordSet ? "Reset Password" : "Set Password"}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Set Pterodactyl Password</DialogTitle>
                <DialogDescription>
                  This password will be used to access the server you bought.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-2">
                <SetPasswordForm pteroId={pteroId} />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
    </Card>
  );
}
