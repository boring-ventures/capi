import { UserManagementHeader } from "@/components/header"
import { UsersTable } from "@/components/users-table"

export default function UserManagementPage() {
  return (
    <div className="container mx-auto p-3 space-y-3">
      <UserManagementHeader />
      <UsersTable />
    </div>
  )
}

