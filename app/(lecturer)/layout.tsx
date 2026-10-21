import { RoleArea } from "@/components/layout/role-area";

export default function LecturerLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleArea area="lecturer" title="Lecturer Dashboard">
      {children}
    </RoleArea>
  );
}
