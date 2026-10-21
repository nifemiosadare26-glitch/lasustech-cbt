import LoginPage from "../page";

/** Lecturer entrance. The API verifies the LECTURER role server-side. */
export default function LecturerLoginPage() {
  return <LoginPage portal="lecturer" />;
}
