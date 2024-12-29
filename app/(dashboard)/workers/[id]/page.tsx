import { notFound } from "next/navigation";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface WorkerPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({
  params,
}: WorkerPageProps): Promise<Metadata> {
  const worker = await getWorker(params.id);

  if (!worker) {
    return {
      title: "Worker Not Found",
    };
  }

  return {
    title: `${worker.name} | New Era Construction`,
    description: `Worker profile for ${worker.name}`,
  };
}

async function getWorker(id: string) {
  const today = new Date().toISOString().split("T")[0];
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const worker = await prisma.worker.findUnique({
    where: { id },
    include: {
      attendance: {
        orderBy: {
          date: "desc",
        },
        where: {
          present: true,
        },
      },
      advances: {
        orderBy: {
          date: "desc",
        },
      },
      assignments: {
        include: {
          project: true,
        },
        orderBy: {
          startDate: "desc",
        },
      },
    },
  });

  console.log('Worker attendance:', worker?.attendance);
  return worker;
}

export default async function WorkerPage({ params }: WorkerPageProps) {
  const worker = await getWorker(params.id);

  if (!worker) {
    notFound();
  }

  // Calculate total earnings
  const totalEarnings = worker.attendance.reduce((sum, record) => {
    const regularPay = record.hoursWorked * worker.hourlyRate;
    const overtimePay = record.overtime * (worker.hourlyRate * 1.5);
    return sum + regularPay + overtimePay;
  }, 0);

  // Calculate total advances
  const totalAdvances = worker.advances.reduce((sum, advance) => sum + advance.amount, 0);

  // Calculate net earnings
  const netEarnings = totalEarnings - totalAdvances;

  return (
    <div className="space-y-6">
      {/* Worker Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{worker.name}</CardTitle>
              <CardDescription>{worker.type}</CardDescription>
            </div>
            <Badge variant={worker.isActive ? "default" : "secondary"}>
              {worker.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 sm:grid-cols-3">
            <div>
              <dt className="font-medium">Hourly Rate</dt>
              <dd>₹{worker.hourlyRate}</dd>
            </div>
            <div>
              <dt className="font-medium">Phone Number</dt>
              <dd>{worker.phoneNumber || "Not provided"}</dd>
            </div>
            <div>
              <dt className="font-medium">Joined</dt>
              <dd>{formatDate(worker.createdAt)}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Financial Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalEarnings.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Advances</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalAdvances.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Net Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{netEarnings.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance History */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance History</CardTitle>
          <CardDescription>Recent attendance records</CardDescription>
        </CardHeader>
        <CardContent>
          {worker.attendance.length === 0 ? (
            <p className="text-sm text-muted-foreground">No attendance records found</p>
          ) : (
            <div className="space-y-4">
              {worker.attendance.slice(0, 10).map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                >
                  <div>
                    <div className="font-medium">{formatDate(record.date)}</div>
                    <div className="text-sm text-muted-foreground">
                      {record.present ? (
                        <>Regular: {record.hoursWorked} hrs | Overtime: {record.overtime} hrs</>
                      ) : (
                        "Absent"
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {record.present ? (
                        <>₹{(record.hoursWorked * worker.hourlyRate + record.overtime * worker.hourlyRate * 1.5).toLocaleString()}</>
                      ) : (
                        "₹0"
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Project Assignments */}
      <Card>
        <CardHeader>
          <CardTitle>Project History</CardTitle>
          <CardDescription>Projects assigned to</CardDescription>
        </CardHeader>
        <CardContent>
          {worker.assignments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No project assignments found</p>
          ) : (
            <div className="space-y-4">
              {worker.assignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                >
                  <div>
                    <div className="font-medium">{assignment.project.projectId}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(assignment.startDate)} -{" "}
                      {assignment.endDate ? formatDate(assignment.endDate) : "Present"}
                    </div>
                  </div>
                  <Badge>{assignment.project.status.toLowerCase()}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Advances */}
      <Card>
        <CardHeader>
          <CardTitle>Advances</CardTitle>
          <CardDescription>Recent advances taken</CardDescription>
        </CardHeader>
        <CardContent>
          {worker.advances.length === 0 ? (
            <p className="text-sm text-muted-foreground">No advances taken</p>
          ) : (
            <div className="space-y-4">
              {worker.advances.map((advance) => (
                <div
                  key={advance.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                >
                  <div>
                    <div className="font-medium">₹{advance.amount.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(advance.date)}
                    </div>
                  </div>
                  <Badge variant={advance.isPaid ? "default" : "secondary"}>
                    {advance.isPaid ? "Paid" : "Unpaid"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
