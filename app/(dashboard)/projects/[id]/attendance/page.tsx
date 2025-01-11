import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import ProjectMusterRoll from "@/components/projects/project-muster-roll";

interface AttendancePageProps {
  params: {
    id: string;
  };
}

async function getProjectWithAttendance(id: string) {
  const today = new Date().toISOString().split("T")[0];

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      workers: {
        include: {
          worker: {
            include: {
              attendance: {
                where: {
                  date: {
                    equals: new Date(today)
                  },
                  projectId: id
                }
              }
            }
          }
        }
      }
    }
  });

  if (!project) return null;

  const workers = project.workers.map(w => ({
    ...w.worker,
    attendance: w.worker.attendance
  }));

  return {
    workers,
    presentCount: workers.filter(w => w.attendance.some(a => a.present)).length
  };
}

export default async function AttendancePage({ params }: AttendancePageProps) {
  const project = await getProjectWithAttendance(params.id);

  if (!project) {
    notFound();
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Attendance</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {project.presentCount} / {project.workers.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Workers present today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={new Date()}
              className="rounded-md border"
            />
          </CardContent>
        </Card>
      </div>

      <ProjectMusterRoll 
        projectId={params.id}
        workers={project.workers}
        date={today}
      />
    </div>
  );
}
