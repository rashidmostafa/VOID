"use client";

import * as React from "react";
import { Button } from "@void/ui/core/Button";
import { Dialog } from "@void/ui/feedback/Dialog";

/* The one client island on the preview surface. Dialog owns no state itself —
   the parent does — so demonstrating it needs a holder.
   It starts open so the theme-swap gate always renders the panel and its
   backdrop under both token sets, rather than an invisible closed element. */
export function DialogDemo() {
  const [open, setOpen] = React.useState(true);

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Open dialog
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Cancel this order?"
        description="Order VD-2451, placed 4 October."
        closeLabel="Close without cancelling"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Keep the order
            </Button>
            <Button variant="destructive" onClick={() => setOpen(false)}>
              Cancel the order
            </Button>
          </>
        }
      >
        <p style={{ font: "var(--type-body)" }}>
          Cancelling returns the reserved stock and refunds ৳2,450 to bKash within three working
          days. A made-to-order piece cannot be cancelled once production starts.
        </p>
      </Dialog>
    </>
  );
}
