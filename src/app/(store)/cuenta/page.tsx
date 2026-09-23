import type { Metadata } from "next";
import { AccountView } from "@/components/account/AccountView";

export const metadata: Metadata = { title: "Mi cuenta", robots: { index: false } };

export default function AccountPage() {
  return (
    <div className="container-x pb-12 pt-28 md:pt-36">
      <p className="eyebrow">Mi cuenta</p>
      <h1 className="display mt-4 text-[clamp(2.5rem,6vw,4.5rem)]">
        Hola <span className="serif-accent text-gradient">de nuevo</span>
      </h1>
      <AccountView />
    </div>
  );
}
