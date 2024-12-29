import Link from "next/link";
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

export const metadata = {
  title: "Workers | New Era Construction",
  description: "Manage workers and their assignments",
};

async function getWorkers() {
  return await prisma.worker.findMany({
    include: {
      assignments: {
        include: {
          project: true,
        },
        where: {
          endDate: null,
        },
      },
      _count: {
        select: {
          attendance: true,
          advances: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export default async function WorkersPage() {
  const workers = await getWorkers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Workers</h1>
        <p className="text-muted-foreground">
          View and manage worker information
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {workers.map((worker) => (
          <Link key={worker.id} href={`/workers/${worker.id}`}>
            <Card className="hover:bg-muted/50 transition-colors">
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
                <dl className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Current Project</dt>
                    <dd className="font-medium">
                      {worker.assignments[0]?.project.projectId || "None"}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Attendance Records</dt>
                    <dd className="font-medium">{worker._count.attendance}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Advances</dt>
                    <dd className="font-medium">{worker._count.advances}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
