import LoginPage from "../page";

/** Administrator entrance. The API verifies the ADMIN role server-side. */
export default function AdminLoginPage() {
  return <LoginPage portal="admin" />;
}
