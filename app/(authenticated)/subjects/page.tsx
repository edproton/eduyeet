import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import SubjectsTable from "./components/subjects-table";
import Link from "next/link";
import { getSystems } from "./action/get-subjects";
import { PopularityCards } from "./components/popularity-cards";
import { SummaryCards } from "./components/summary-cards";

export default async function SubjectsPage() {
  const systems = await getSystems();

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          Tutoring System Hierarchy Dashboard
        </h1>
        <Link href="/subjects/add-system">
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" /> Create New System
          </Button>
        </Link>
      </div>

      <Suspense fallback={<div>Loading summary...</div>}>
        <SummaryCards systems={systems} />
      </Suspense>

      <Suspense fallback={<div>Loading popularity data...</div>}>
        <PopularityCards systems={systems} />
      </Suspense>

      <Suspense fallback={<div>Loading subjects table...</div>}>
        <SubjectsTable systems={systems} />
      </Suspense>
    </div>
  );
}
