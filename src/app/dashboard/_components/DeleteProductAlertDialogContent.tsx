"use client";

import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { createCancelSession } from "@/server/actions/stripe";
import { useTransition } from "react";

export function DeleteProductAlertDialogContent({ _id }: { _id: string }) {
  const [isDeletePending, startDeleteTransition] = useTransition();
  const { toast } = useToast();

  return (
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
        <AlertDialogDescription>
          This action cannot be undone. This will permanently delete this
          server. Please make sure all files have been saved to your local
          device.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction
          onClick={() => {
            startDeleteTransition(async () => {
              await createCancelSession(_id);
            });
          }}
          disabled={isDeletePending}
        >
          Delete Server
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
}
