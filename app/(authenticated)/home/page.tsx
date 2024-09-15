"use client";
import { useState } from "react";
import {
  BookOpen,
  Calendar,
  ChevronLeft,
  Clock,
  FileText,
  Users,
  Users2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function HomePage() {
  return <UsersAnalitycsPage />;
}

export function UsersAnalitycsPage() {
  const [activeTab, setActiveTab] = useState("students");
  const [studentFilter, setStudentFilter] = useState({
    subject: "All",
    status: "All",
  });
  const [tutorFilter, setTutorFilter] = useState({
    subject: "All",
    rating: "All",
  });

  return (
    <Tabs
      defaultValue="students"
      className="space-y-4"
      onValueChange={(value) => setActiveTab(value)}
    >
      <TabsList>
        <TabsTrigger value="students">Students</TabsTrigger>
        <TabsTrigger value="tutors">Tutors</TabsTrigger>
      </TabsList>
      <TabsContent value="students" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Students
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,329</div>
              <p className="text-xs text-muted-foreground">
                +20% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Bookings
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">245</div>
              <p className="text-xs text-muted-foreground">
                +15% from last week
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Popular Subjects
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Mathematics</div>
              <p className="text-xs text-muted-foreground">
                30% of all bookings
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Session Duration
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1h 15m</div>
              <p className="text-xs text-muted-foreground">
                +5 minutes from last month
              </p>
            </CardContent>
          </Card>
        </div>
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Student Bookings</CardTitle>
            <CardDescription>
              Filter and view recent student bookings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2 mb-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    Subject: {studentFilter.subject}{" "}
                    <ChevronLeft className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onSelect={() =>
                      setStudentFilter({
                        ...studentFilter,
                        subject: "All",
                      })
                    }
                  >
                    All
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() =>
                      setStudentFilter({
                        ...studentFilter,
                        subject: "Mathematics",
                      })
                    }
                  >
                    Mathematics
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() =>
                      setStudentFilter({
                        ...studentFilter,
                        subject: "Physics",
                      })
                    }
                  >
                    Physics
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() =>
                      setStudentFilter({
                        ...studentFilter,
                        subject: "Chemistry",
                      })
                    }
                  >
                    Chemistry
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() =>
                      setStudentFilter({
                        ...studentFilter,
                        subject: "Biology",
                      })
                    }
                  >
                    Biology
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    Status: {studentFilter.status}{" "}
                    <ChevronLeft className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onSelect={() =>
                      setStudentFilter({
                        ...studentFilter,
                        status: "All",
                      })
                    }
                  >
                    All
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() =>
                      setStudentFilter({
                        ...studentFilter,
                        status: "Upcoming",
                      })
                    }
                  >
                    Upcoming
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() =>
                      setStudentFilter({
                        ...studentFilter,
                        status: "Completed",
                      })
                    }
                  >
                    Completed
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Tutor</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Sophia Chen</TableCell>
                  <TableCell>Mathematics</TableCell>
                  <TableCell>Dr. Alex Johnson</TableCell>
                  <TableCell>2023-06-28</TableCell>
                  <TableCell>
                    <Badge>Upcoming</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Ethan Williams</TableCell>
                  <TableCell>Physics</TableCell>
                  <TableCell>Prof. Sarah Lee</TableCell>
                  <TableCell>2023-06-27</TableCell>
                  <TableCell>
                    <Badge variant="secondary">Completed</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Olivia Taylor</TableCell>
                  <TableCell>Chemistry</TableCell>
                  <TableCell>Dr. Michael Brown</TableCell>
                  <TableCell>2023-06-29</TableCell>
                  <TableCell>
                    <Badge>Upcoming</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Liam Johnson</TableCell>
                  <TableCell>Biology</TableCell>
                  <TableCell>Prof. Emily White</TableCell>
                  <TableCell>2023-06-26</TableCell>
                  <TableCell>
                    <Badge variant="secondary">Completed</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="tutors" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Tutors
              </CardTitle>
              <Users2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">284</div>
              <p className="text-xs text-muted-foreground">
                +5% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Booked Hours
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,892</div>
              <p className="text-xs text-muted-foreground">
                +10% from last week
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Top Rated Subject
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Computer Science</div>
              <p className="text-xs text-muted-foreground">
                4.9 average rating
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Hourly Rate
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$35</div>
              <p className="text-xs text-muted-foreground">
                +$2 from last month
              </p>
            </CardContent>
          </Card>
        </div>
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Top Performing Tutors</CardTitle>
            <CardDescription>
              Filter and view top performing tutors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2 mb-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    Subject: {tutorFilter.subject}{" "}
                    <ChevronLeft className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onSelect={() =>
                      setTutorFilter({ ...tutorFilter, subject: "All" })
                    }
                  >
                    All
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() =>
                      setTutorFilter({
                        ...tutorFilter,
                        subject: "Mathematics",
                      })
                    }
                  >
                    Mathematics
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() =>
                      setTutorFilter({
                        ...tutorFilter,
                        subject: "Physics",
                      })
                    }
                  >
                    Physics
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() =>
                      setTutorFilter({
                        ...tutorFilter,
                        subject: "Chemistry",
                      })
                    }
                  >
                    Chemistry
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() =>
                      setTutorFilter({
                        ...tutorFilter,
                        subject: "Computer Science",
                      })
                    }
                  >
                    Computer Science
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    Rating: {tutorFilter.rating}{" "}
                    <ChevronLeft className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onSelect={() =>
                      setTutorFilter({ ...tutorFilter, rating: "All" })
                    }
                  >
                    All
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() =>
                      setTutorFilter({
                        ...tutorFilter,
                        rating: "5 Stars",
                      })
                    }
                  >
                    5 Stars
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() =>
                      setTutorFilter({
                        ...tutorFilter,
                        rating: "4+ Stars",
                      })
                    }
                  >
                    4+ Stars
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() =>
                      setTutorFilter({
                        ...tutorFilter,
                        rating: "3+ Stars",
                      })
                    }
                  >
                    3+ Stars
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tutor</TableHead>
                  <TableHead>Subjects</TableHead>
                  <TableHead>Total Hours</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Earnings</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">
                    Dr. Alex Johnson
                  </TableCell>
                  <TableCell>Mathematics, Physics</TableCell>
                  <TableCell>120</TableCell>
                  <TableCell>
                    4.9 <span className="text-yellow-500">★★★★★</span>
                  </TableCell>
                  <TableCell>$4,200</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      View Profile
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Prof. Sarah Lee</TableCell>
                  <TableCell>Chemistry, Biology</TableCell>
                  <TableCell>98</TableCell>
                  <TableCell>
                    4.8 <span className="text-yellow-500">★★★★★</span>
                  </TableCell>
                  <TableCell>$3,430</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      View Profile
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">
                    Dr. Michael Brown
                  </TableCell>
                  <TableCell>Computer Science</TableCell>
                  <TableCell>105</TableCell>
                  <TableCell>
                    4.7 <span className="text-yellow-500">★★★★★</span>
                  </TableCell>
                  <TableCell>$3,675</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      View Profile
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">
                    Prof. Emily White
                  </TableCell>
                  <TableCell>English Literature</TableCell>
                  <TableCell>87</TableCell>
                  <TableCell>
                    4.9 <span className="text-yellow-500">★★★★★</span>
                  </TableCell>
                  <TableCell>$3,045</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      View Profile
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
