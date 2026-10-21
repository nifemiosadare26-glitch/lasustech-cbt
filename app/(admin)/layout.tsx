import { RoleArea } from "@/components/layout/role-area";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleArea area="admin" title="Admin Dashboard">
      {children}
    </RoleArea>
  );
}
