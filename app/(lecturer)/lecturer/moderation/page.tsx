import { redirect } from "next/navigation";

export default function LecturerModerationRedirect() {
  redirect("/lecturer/questions");
}
