import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserLogins } from "../actions";
import { Badge } from "@/components/ui/badge";
import SessionActions from "./revoke-session-form";

interface UserSessionsTableProps {
  userId: number;
}

export default async function UserSessionsTable({
  userId,
}: UserSessionsTableProps) {
  const { sessions, totalSessions } = await getUserLogins(userId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Sessions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-muted-foreground flex gap-2">
            <Badge variant="default">Active: {totalSessions.active}</Badge>
            <Badge variant="secondary">Revoked: {totalSessions.revoked}</Badge>
            <Badge variant="secondary">Total: {totalSessions.total}</Badge>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>IP Address</TableHead>
              <TableHead>Last Used</TableHead>
              <TableHead className="w-[50px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.map((session) => (
              <TableRow key={session.id}>
                <TableCell>
                  <div className="flex items-center">
                    <Badge variant="outline" className="px-1 py-0">
                      {session.ipAddress}
                    </Badge>

                    {session.isCurrent && (
                      <Badge variant="success" className="ml-2">
                        Current Session
                      </Badge>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {session.device}
                  </span>
                </TableCell>
                <TableCell>
                  {new Date(session.lastUsed!).toLocaleString()}
                </TableCell>
                <TableCell>
                  <SessionActions sessionId={session.id} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
