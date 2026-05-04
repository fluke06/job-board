"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function DeleteUserButton({
  userId,
  userName,
  disabled = false,
}: {
  userId: string;
  userName: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    setPending(true);
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "DELETE",
    });
    setPending(false);
    if (res.ok) {
      toast.success("User deleted");
      setOpen(false);
      router.refresh();
      return;
    }
    const err = await res.json().catch(() => ({}));
    toast.error(err?.error ?? "Failed to delete");
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        disabled={disabled}
        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
      >
        Delete
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {userName}?</DialogTitle>
            <DialogDescription>
              This permanently removes the account and all of their
              applications. Company memberships are removed too.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={pending}
            >
              {pending ? "Deleting…" : "Delete user"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function DeleteCompanyButton({
  slug,
  name,
}: {
  slug: string;
  name: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    setPending(true);
    const res = await fetch(`/api/admin/companies/${slug}`, {
      method: "DELETE",
    });
    setPending(false);
    if (res.ok) {
      toast.success("Company deleted");
      setOpen(false);
      router.refresh();
      return;
    }
    const err = await res.json().catch(() => ({}));
    toast.error(err?.error ?? "Failed to delete");
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
      >
        Delete
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {name}?</DialogTitle>
            <DialogDescription>
              This permanently removes the company, every job they posted, and
              every application against those jobs. Member users are kept but
              lose their company membership.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={pending}
            >
              {pending ? "Deleting…" : "Delete company"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
