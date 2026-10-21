import LoginPage from "../page";

/** Student entrance. The API verifies the STUDENT role server-side. */
export default function StudentLoginPage() {
  return <LoginPage portal="student" />;
}
