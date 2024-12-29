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

interface ProjectWorkerPageProps {
  params: {
    id: string;      // Project ID
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

  if (!assignment) return null;

  return assignment;
}

export default async function ProjectWorkerPage({ params }: ProjectWorkerPageProps) {
  const data = await getProjectWorkerData(params.id, params.workerId);

  if (!data) {
    notFound();
  }

  const { worker, project } = data;

  // Calculate project-specific metrics
  const projectStartDate = data.startDate;
  const projectEndDate = data.endDate || new Date();

  // Filter attendance records for this project's duration
  const projectAttendance = worker.attendance.filter(
    (record) =>
      record.date >= projectStartDate && record.date <= projectEndDate
  );

  // Calculate project-specific earnings
  const projectEarnings = projectAttendance.reduce((sum, record) => {
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
    totalDays: currentMonthAttendance.length,
    totalHours: currentMonthAttendance.reduce(
      (sum, record) => sum + record.hoursWorked + record.overtime,
      0
    ),
    regularHours: currentMonthAttendance.reduce(
      (sum, record) => sum + record.hoursWorked,
      0
    ),
    overtimeHours: currentMonthAttendance.reduce(
      (sum, record) => sum + record.overtime,
      0
    ),
  };

  // Calculate monthly earnings
  const monthlyEarnings = currentMonthAttendance.reduce((sum, record) => {
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
              <CardDescription>
                {worker.type} • {project.projectId}
              </CardDescription>
            </div>
            <Badge>
              {data.endDate ? "Completed" : "Active"}
            </Badge>
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
            <CardTitle className="text-sm font-medium">Days Worked</CardTitle>
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
              Regular: {monthlyStats.regularHours} | OT: {monthlyStats.overtimeHours}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Monthly Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{monthlyEarnings.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Monthly Advances</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{monthlyAdvances.toLocaleString()}</div>
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
            <p className="text-sm text-muted-foreground">No attendance records found</p>
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
                      Regular: {record.hoursWorked} hrs | Overtime: {record.overtime} hrs
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      ₹{(record.hoursWorked * worker.hourlyRate + record.overtime * worker.hourlyRate * 1.5).toLocaleString()}
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
