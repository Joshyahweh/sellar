"use client";

import { useState } from "react";
import { PlaceOrderModal } from "@/components/checkout/place-order-modal";
import { CtaButton } from "@/components/landing/cta-button";
import type { DeliveryAddress } from "@/lib/orders";

export function PlaceOrderButton({
  format,
  previous = null,
}: {
  format: string;
  previous?: DeliveryAddress | null;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <CtaButton type="button" onClick={() => setOpen(true)}>
        Place an order
      </CtaButton>
      {open ? (
        <PlaceOrderModal
          format={format}
          previous={previous}
          onDismiss={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}
