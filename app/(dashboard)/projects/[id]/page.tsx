import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { getMaterialUnit } from "@/lib/utils/materials";
import { Badge } from "@/components/ui/badge";
import AddWorkerButton from "@/components/projects/add-worker-button";
import AddMaterialButton from "@/components/projects/add-material-button";
import AddMachineryButton from "@/components/projects/add-machinery-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ProjectMusterRoll from "@/components/projects/project-muster-roll";
import { MaterialType } from "@prisma/client";

interface ProjectPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const project = await getProject(params.id);

  if (!project) {
    return {
      title: "Project Not Found",
    };
  }

  return {
    title: `${project.projectId} | New Era Construction`,
    description: `Project details for ${project.projectId}`,
  };
}

async function getProject(id: string) {
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
                    equals: new Date(today),
                  },
                },
              },
            },
          },
        },
      },
      materials: true,
      machinery: true,
    },
  });

  if (!project) return null;

  // Aggregate materials by type
  const aggregatedMaterials = project.materials.reduce((acc, material) => {
    const existingMaterial = acc.find((m) => m.type === material.type);
    if (existingMaterial) {
      existingMaterial.volume += material.volume;
      existingMaterial.cost += material.cost;
    } else {
      acc.push({ ...material });
    }
    return acc;
  }, [] as typeof project.materials);

  // Aggregate machinery by type
  const aggregatedMachinery = project.machinery.reduce((acc, machine) => {
    const existingMachine = acc.find((m) => m.type === machine.type);
    if (existingMachine) {
      existingMachine.hours += (machine.hoursUsed || 0);
      existingMachine.cost += (machine.totalCost || 0);
    } else {
      acc.push({ ...machine });
    }
    return acc;
  }, [] as typeof project.machinery);

  return {
    ...project,
    materials: aggregatedMaterials,
    machinery: aggregatedMachinery,
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const project = await getProject(params.id);

  if (!project) {
    notFound();
  }

  return (
    <div className="container">
      <div className="grid gap-6">
        {/* Project Overview Card */}
        <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{project.projectId}</CardTitle>
                <CardDescription>{project.clientName}</CardDescription>
              </div>
              <Badge>{project.status.toLowerCase()}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="font-medium">Location</dt>
                <dd>{project.location}</dd>
              </div>
              <div>
                <dt className="font-medium">Start Date</dt>
                <dd>{formatDate(project.startDate)}</dd>
              </div>
              {project.endDate && (
                <div>
                  <dt className="font-medium">End Date</dt>
                  <dd>{formatDate(project.endDate)}</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>

        {/* Workers Section */}
        <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Workers</CardTitle>
                <CardDescription>
                  Workers assigned to this project
                </CardDescription>
              </div>
              <div className="flex items-center gap-4">
                <AddWorkerButton projectId={project.id} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {project.workers.length === 0 ? (
              <p className="text-muted-foreground">No workers assigned yet</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {project.workers.map((assignment) => (
                  <Link
                    key={assignment.worker.id}
                    href={`/projects/${project.id}/workers/${assignment.worker.id}`}
                  >
                    <div className="space-y-1 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                      <p className="font-medium">{assignment.worker.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {assignment.worker.type}
                      </p>
                      {assignment.worker.attendance[0] && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Today:{" "}
                          {assignment.worker.attendance[0].hoursWorked +
                            assignment.worker.attendance[0].overtime}{" "}
                          hrs
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Materials Section */}
        <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Materials</CardTitle>
                <CardDescription>
                  Materials used in this project
                </CardDescription>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium">Total Cost</p>
                  <p className="text-lg font-bold">
                    ₹
                    {project.materials
                      .reduce((sum, material) => sum + material.cost, 0)
                      .toLocaleString()}
                  </p>
                </div>
                <AddMaterialButton projectId={project.id} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {project.materials.length === 0 ? (
              <p className="text-muted-foreground">No materials used yet</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {project.materials.map((usage) => (
                  <Link
                    key={usage.type}
                    href={`/projects/${project.id}/material/${usage.id}`}
                  >
                    <div className="space-y-1 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                      <p className="font-medium">
                        {usage.type.replace(/_/g, " ")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Total Volume: {usage.volume} {getMaterialUnit(usage.type)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Total Cost: ₹{usage.cost.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Rate: ₹{(usage.cost / usage.volume).toFixed(2)} per{" "}
                        {getMaterialUnit(usage.type)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Machinery Section */}
        <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Machinery</CardTitle>
                <CardDescription>
                  Machinery used in this project
                </CardDescription>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium">Total Cost</p>
                  <p className="text-lg font-bold">
                    ₹
                    {project.machinery
                      .reduce((sum, machine) => sum + machine.totalCost, 0)
                      .toLocaleString()}
                  </p>
                </div>
                <AddMachineryButton projectId={project.id} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {project.machinery.length === 0 ? (
              <p className="text-muted-foreground">No machinery used yet</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {project.machinery.map((usage) => (
                  <Link
                    key={usage.type}
                    href={`/projects/${project.id}/machinery/${usage.id}`}
                  >
                    <div className="space-y-1 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                      <p className="font-medium">
                        {usage.type.replace(/_/g, " ")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Total Hours: {usage.hoursUsed}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Total Cost: ₹{usage.totalCost.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Rate: ₹{(usage.totalCost / usage.hoursUsed).toFixed(2)} per hour
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mt-8 bg-white shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Daily Attendance</CardTitle>
            <CardDescription>
              Track workers' attendance and hours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProjectMusterRoll
              projectId={project.id}
              workers={project.workers.map((assignment) => ({
                ...assignment.worker,
                attendance: assignment.worker.attendance,
              }))}
              date={new Date().toISOString().split("T")[0]}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
