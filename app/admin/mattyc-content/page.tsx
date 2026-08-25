import type { Metadata } from "next";
import { getAdminConfiguration, isAdminAuthenticated } from "../../../lib/admin-auth";
import { AdminContentClient } from "./AdminContentClient";

export const metadata: Metadata = {
  title: "MattYC Content Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function MattYCContentAdminPage() {
  const [authenticated, configuration] = await Promise.all([
    isAdminAuthenticated(),
    Promise.resolve(getAdminConfiguration()),
  ]);

  return (
    <AdminContentClient
      initialAuthenticated={authenticated}
      configured={configuration.configured}
    />
  );
}
