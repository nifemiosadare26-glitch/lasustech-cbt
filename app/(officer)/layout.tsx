import { AppShell } from "@/components/layout/app-shell";

export default function RoleLayout({ children }: { children: React.ReactNode }) {
  return <AppShell role="officer" title="Officer Dashboard">{children}</AppShell>;
}
