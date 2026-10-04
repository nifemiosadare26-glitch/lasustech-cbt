import { AppShell } from "@/components/layout/app-shell";

export default function RoleLayout({ children }: { children: React.ReactNode }) {
  return <AppShell role="invigilator" title="Invigilator Dashboard">{children}</AppShell>;
}
