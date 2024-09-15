import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { System } from "../action/get-subjects";

interface SummaryCardsProps {
  systems: System[];
}

export function SummaryCards({ systems }: SummaryCardsProps) {
  const totalSystems = systems.length;
  const totalSubjects = systems.reduce(
    (acc, system) => acc + system.subjects.length,
    0
  );
  const totalQualifications = systems.reduce(
    (acc, system) =>
      acc +
      system.subjects.reduce(
        (subAcc, subject) => subAcc + subject.qualifications.length,
        0
      ),
    0
  );

  return (
    <div className="grid gap-4 md:grid-cols-3 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Systems</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalSystems}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Subjects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalSubjects}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Qualifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalQualifications}</div>
        </CardContent>
      </Card>
    </div>
  );
}
