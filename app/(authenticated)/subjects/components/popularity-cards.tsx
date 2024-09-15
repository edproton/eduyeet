import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { System, Subject, Qualification } from "../action/get-subjects";

interface PopularityCardsProps {
  systems: System[];
}

interface PopularItem {
  name: string;
  count: number;
}

export function PopularityCards({ systems }: PopularityCardsProps) {
  const getMostPopular = (
    items: (System | Subject | Qualification)[]
  ): PopularItem => {
    return items.reduce(
      (max, item) =>
        item.students > max.count
          ? { name: item.name, count: item.students }
          : max,
      { name: "", count: 0 }
    );
  };

  const mostPopularSystem = getMostPopular(systems);
  const mostPopularSubject = getMostPopular(systems.flatMap((s) => s.subjects));
  const mostPopularQualification = getMostPopular(
    systems.flatMap((s) => s.subjects.flatMap((sub) => sub.qualifications))
  );

  return (
    <div className="grid gap-4 md:grid-cols-3 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Most Popular System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{mostPopularSystem.name}</div>
          <p className="text-xs text-muted-foreground">
            {mostPopularSystem.count} students
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Most Popular Subject
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{mostPopularSubject.name}</div>
          <p className="text-xs text-muted-foreground">
            {mostPopularSubject.count} students
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Most Popular Qualification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {mostPopularQualification.name}
          </div>
          <p className="text-xs text-muted-foreground">
            {mostPopularQualification.count} students
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
