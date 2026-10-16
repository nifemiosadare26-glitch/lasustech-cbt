import { redirect } from "next/navigation";

export default function InvigilatorPageRedirect() {
  redirect("/admin/live");
}
