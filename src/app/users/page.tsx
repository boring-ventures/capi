import { UserManagementHeader } from "@/components/user-management/header"
import { UsersTable } from "@/components/user-management/users-table"

export default function UserManagementPage() {
  return (
    <div className="container mx-auto py-10">
      <UserManagementHeader />
      <UsersTable />
    </div>
  )
}

