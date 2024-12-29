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
import { EditWorkerDialog } from "./edit-worker-dialog";

interface ProjectWorkerPageProps {
  params: {
    id: string; // Project ID
    workerId: string; // Worker ID
  };
}

export async function generateMetadata({
  params,
}: ProjectWorkerPageProps): Promise<Metadata> {
  const data = await getProjectWorkerData(params.id, params.workerId);

  if (!data) {
    return {
      title: "Worker Not Found",
    };
  }

  return {
    title: `${data.worker.name} - ${data.project.projectId} | New Era Construction`,
    description: `Worker details for ${data.worker.name} in project ${data.project.projectId}`,
  };
}

async function getProjectWorkerData(projectId: string, workerId: string) {
  console.log("Fetching project worker data:", { projectId, workerId });

  const assignment = await prisma.workerAssignment.findUnique({
    where: {
      workerId_projectId: {
        workerId,
        projectId,
      },
    },
    include: {
      worker: {
        include: {
          attendance: {
            where: {
              projectId,
            },
            orderBy: {
              date: "desc",
            },
          },
          advances: {
            where: {
              date: {
                gte: new Date(new Date().setDate(1)), // From start of current month
              },
            },
            orderBy: {
              date: "desc",
            },
          },
        },
      },
      project: true,
    },
  });

  console.log("Found worker assignment:", {
    found: !!assignment,
    workerId: assignment?.workerId,
    projectId: assignment?.projectId,
    attendanceCount: assignment?.worker.attendance.length,
    attendance: assignment?.worker.attendance,
  });

  if (!assignment) return null;
  return assignment;
}

export default async function ProjectWorkerPage({
  params,
}: ProjectWorkerPageProps) {
  const data = await getProjectWorkerData(params.id, params.workerId);

  if (!data) {
    notFound();
  }

  const { worker, project } = data;

  // Calculate project-specific metrics
  const projectStartDate = data.startDate;
  const projectEndDate = data.endDate || new Date();

  console.log("Project dates:", {
    startDate: projectStartDate,
    endDate: projectEndDate,
    totalAttendance: worker.attendance.length,
  });

  // Project attendance is already filtered by projectId in the query
  const projectAttendance = worker.attendance;

  console.log("Project attendance:", {
    total: projectAttendance.length,
    records: projectAttendance,
  });

  // Calculate project-specific earnings
  const projectEarnings = projectAttendance.reduce((sum, record) => {
    if (!record.present) return sum;
    const regularPay = record.hoursWorked * worker.hourlyRate;
    const overtimePay = record.overtime * (worker.hourlyRate * 1.5);
    return sum + regularPay + overtimePay;
  }, 0);

  // Calculate monthly statistics
  const currentMonth = new Date().getMonth();
  const currentMonthAttendance = projectAttendance.filter(
    (record) => record.date.getMonth() === currentMonth
  );

  const monthlyStats = {
    totalDays: currentMonthAttendance.filter((record) => record.present).length,
    totalHours: currentMonthAttendance.reduce(
      (sum, record) =>
        record.present ? sum + record.hoursWorked + record.overtime : sum,
      0
    ),
    regularHours: currentMonthAttendance.reduce(
      (sum, record) => (record.present ? sum + record.hoursWorked : sum),
      0
    ),
    overtimeHours: currentMonthAttendance.reduce(
      (sum, record) => (record.present ? sum + record.overtime : sum),
      0
    ),
  };

  // Calculate monthly earnings
  const monthlyEarnings = currentMonthAttendance.reduce((sum, record) => {
    if (!record.present) return sum;
    const regularPay = record.hoursWorked * worker.hourlyRate;
    const overtimePay = record.overtime * (worker.hourlyRate * 1.5);
    return sum + regularPay + overtimePay;
  }, 0);

  // Calculate monthly advances
  const monthlyAdvances = worker.advances.reduce(
    (sum, advance) => sum + advance.amount,
    0
  );

  return (
    <div className="space-y-6">
      {/* Worker Project Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{worker.name}</CardTitle>
              <CardDescription>{worker.type}</CardDescription>
            </div>
            <EditWorkerDialog worker={worker} />
          </div>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 sm:grid-cols-3">
            <div>
              <dt className="font-medium">Start Date</dt>
              <dd>{formatDate(data.startDate)}</dd>
            </div>
            {data.endDate && (
              <div>
                <dt className="font-medium">End Date</dt>
                <dd>{formatDate(data.endDate)}</dd>
              </div>
            )}
            <div>
              <dt className="font-medium">Hourly Rate</dt>
              <dd>₹{worker.hourlyRate}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Monthly Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Days Present</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthlyStats.totalDays}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthlyStats.totalHours}</div>
            <p className="text-xs text-muted-foreground">
              Regular: {monthlyStats.regularHours} | OT:{" "}
              {monthlyStats.overtimeHours}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Monthly Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{monthlyEarnings.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Monthly Advances
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{monthlyAdvances.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project Attendance */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance History</CardTitle>
          <CardDescription>Recent attendance in this project</CardDescription>
        </CardHeader>
        <CardContent>
          {projectAttendance.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No attendance records found
            </p>
          ) : (
            <div className="space-y-4">
              {projectAttendance.slice(0, 10).map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                >
                  <div>
                    <div className="font-medium">{formatDate(record.date)}</div>
                    <div className="text-sm text-muted-foreground">
                      {record.present ? (
                        <>
                          Regular: {record.hoursWorked} hrs | Overtime:{" "}
                          {record.overtime} hrs
                        </>
                      ) : (
                        "Absent"
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {record.present ? (
                        <>
                          ₹
                          {(
                            record.hoursWorked * worker.hourlyRate +
                            record.overtime * worker.hourlyRate * 1.5
                          ).toLocaleString()}
                        </>
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

      {/* Recent Advances */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Advances</CardTitle>
          <CardDescription>Advances taken during this project</CardDescription>
        </CardHeader>
        <CardContent>
          {worker.advances.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent advances</p>
          ) : (
            <div className="space-y-4">
              {worker.advances.map((advance) => (
                <div
                  key={advance.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                >
                  <div>
                    <div className="font-medium">
                      ₹{advance.amount.toLocaleString()}
                    </div>
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
