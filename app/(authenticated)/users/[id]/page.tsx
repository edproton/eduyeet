import { ArrowLeft } from "lucide-react";
import { getUser } from "./actions";
import UserDetailsCard from "./components/user-details-card";
import { Button } from "@/components/ui/button";
import SessionSummaryCard from "./components/session-summary-card";
import RolesCard from "./components/roles-card";
import Link from "next/link";

export default async function UserDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const userId = parseInt(params.id, 10);
  const user = await getUser(userId);
  if (!user) {
    return <div className="p-4">User not found</div>;
  }

  return (
    <>
      <Link href="/users">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Users
        </Button>
      </Link>

      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <UserDetailsCard user={user} />
          <RolesCard />
          <div className="col-span-2">
            <SessionSummaryCard userId={user.id} />
          </div>
        </div>
      </div>
    </>
  );
}
