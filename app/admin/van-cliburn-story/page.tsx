import type { Metadata } from "next";
import { getAdminConfiguration, isAdminAuthenticated } from "../../../lib/admin-auth";
import { VanCliburnStoryAdminClient } from "./VanCliburnStoryAdminClient";

export const metadata: Metadata = {
  title: "Van Cliburn Journey Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function VanCliburnStoryAdminPage() {
  const [authenticated, configuration] = await Promise.all([
    isAdminAuthenticated(),
    Promise.resolve(getAdminConfiguration()),
  ]);

  return (
    <VanCliburnStoryAdminClient
      initialAuthenticated={authenticated}
      configured={configuration.configured}
    />
  );
}
