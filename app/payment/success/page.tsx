import { CheckoutShell } from "@/components/checkout/checkout-shell";
import { PaymentSuccessModal } from "@/components/checkout/payment-modals";

export default function PaymentSuccessPage() {
  return (
    <CheckoutShell showPayBanner>
      <PaymentSuccessModal />
    </CheckoutShell>
  );
}
