import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getUserLogins } from "../actions";
import { Badge } from "@/components/ui/badge";
import SessionActions from "./revoke-session-form";

interface UserSessionsTableProps {
  userId: number;
}

export default async function UserSessionsTable({
  userId,
}: UserSessionsTableProps) {
  const { sessions } = await getUserLogins(userId);

  return (
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
  );
}
