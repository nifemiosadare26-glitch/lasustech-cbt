import { redirect } from "next/navigation";

/**
 * Redirect /dashboard to the unified LASUSTECH CBT Admin portal at /admin.
 */
export default function AdminDashboardRedirect() {
  redirect("/admin");
}
