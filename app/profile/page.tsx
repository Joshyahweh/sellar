import { connection } from "next/server";
import { Suspense } from "react";
import { ProfileView } from "@/components/account/profile-view";
import { ProfileSkeleton } from "@/components/landing/section-skeletons";
import { getPendingOrder, latestDeliveryAddress } from "@/lib/orders.server";
import { createClient } from "@/lib/supabase/server";

async function ProfileGate() {
  await connection();
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  const { data: profile } = user
    ? await supabase.from("profiles").select("full_name, email").eq("id", user.id).maybeSingle()
    : { data: null };
  const name = String(profile?.full_name ?? user?.user_metadata?.full_name ?? "").trim() || "Your profile";
  const email = String(profile?.email ?? user?.email ?? "");
  const address = await latestDeliveryAddress();
  const pending = await getPendingOrder().catch(() => null);
  return (
    <ProfileView
      name={name}
      email={email}
      phone={address?.phone ?? ""}
      address={address}
      format={pending?.productSlug || "hard-copy"}
      orderId={pending?.id ?? null}
    />
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ProfileGate />
    </Suspense>
  );
}
