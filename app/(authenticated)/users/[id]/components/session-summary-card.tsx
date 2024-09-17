import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, Shield, Smartphone } from "lucide-react";
import { getUserSessions } from "../actions";
import UserSessionsTable from "./user-logins-table";

interface SessionSummaryCardProps {
  userId: number;
}

export default async function SessionSummaryCard({
  userId,
}: SessionSummaryCardProps) {
  let sessionData;
  try {
    sessionData = await getUserSessions(userId);
  } catch (error) {
    console.error("Failed to fetch session data:", error);
    return (
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>Session Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">
            Failed to load session data
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!sessionData) {
    return (
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>Session Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">No session data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="md:col-span-1">
      <CardHeader>
        <CardTitle>Session Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="space-y-4">
          <div>
            <dt className="text-sm font-medium text-muted-foreground flex items-center">
              <Users className="mr-2 h-4 w-4" /> Active Sessions
            </dt>
            <dd className="mt-1 text-sm">{sessionData.activeSessions}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground flex items-center">
              <Clock className="mr-2 h-4 w-4" /> Last Login
            </dt>
            <dd className="mt-1 text-sm">
              {sessionData.lastLogin.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground flex items-center">
              <Shield className="mr-2 h-4 w-4" /> Revoked Sessions
            </dt>
            <dd className="mt-1 text-sm">{sessionData.revokedSessions}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground flex items-center">
              <Users className="mr-2 h-4 w-4" /> Total Sessions
            </dt>
            <dd className="mt-1 text-sm">{sessionData.totalSessions}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground flex items-center">
              <Smartphone className="mr-2 h-4 w-4" /> Last Used Device
            </dt>
            <dd className="mt-1 text-sm">{sessionData.lastUsedDevice}</dd>
          </div>

          <UserSessionsTable userId={userId} />
        </dl>
      </CardContent>
    </Card>
  );
}
