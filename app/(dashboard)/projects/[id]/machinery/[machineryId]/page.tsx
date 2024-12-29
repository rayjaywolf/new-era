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

interface ProjectMachineryPageProps {
  params: {
    id: string; // Project ID
    machineryId: string; // Machinery Usage ID
  };
}

export async function generateMetadata({
  params,
}: ProjectMachineryPageProps): Promise<Metadata> {
  const data = await getProjectMachineryData(params.id, params.machineryId);

  if (!data) {
    return {
      title: "Machinery Not Found",
    };
  }

  return {
    title: `${data.type} - ${data.project.projectId} | New Era Construction`,
    description: `Machinery usage details for ${data.type} in project ${data.project.projectId}`,
  };
}

async function getProjectMachineryData(projectId: string, machineryId: string) {
  const machinery = await prisma.machineryUsage.findFirst({
    where: {
      id: machineryId,
      projectId: projectId,
    },
    include: {
      project: true,
    },
  });

  if (!machinery) return null;

  // Get all machinery of the same type in this project
  const relatedMachinery = await prisma.machineryUsage.findMany({
    where: {
      projectId: projectId,
      type: machinery.type,
    },
    orderBy: {
      date: "desc",
    },
  });

  return {
    ...machinery,
    relatedMachinery,
  };
}

export default async function ProjectMachineryPage({
  params,
}: ProjectMachineryPageProps) {
  const data = await getProjectMachineryData(params.id, params.machineryId);

  if (!data) {
    notFound();
  }

  const { project, relatedMachinery } = data;

  // Calculate total usage of this machinery type in the project
  const totalHours = [data, ...relatedMachinery].reduce(
    (sum, machine) => sum + machine.hoursUsed,
    0
  );
  const totalCost = [data, ...relatedMachinery].reduce(
    (sum, machine) => sum + machine.totalCost,
    0
  );

  return (
    <div className="space-y-6">
      {/* Machinery Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {data.type.replace(/_/g, " ")}
                {data.type === "JCB" && data.jcbSubtype
                  ? ` - ${data.jcbSubtype}`
                  : data.type === "SLM" && data.slmSubtype
                    ? ` - ${data.slmSubtype}`
                    : ""}
              </CardTitle>
              <CardDescription>{project.projectId}</CardDescription>
            </div>
            <Badge>{formatDate(data.date)}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 sm:grid-cols-3">
            <div>
              <dt className="font-medium">Hours Used</dt>
              <dd>{data.hoursUsed} hrs</dd>
            </div>
            <div>
              <dt className="font-medium">Hourly Rate</dt>
              <dd>₹{data.hourlyRate}</dd>
            </div>
            <div>
              <dt className="font-medium">Total Cost</dt>
              <dd>₹{data.totalCost.toLocaleString()}</dd>
            </div>
            {data.operatorName && (
              <div>
                <dt className="font-medium">Operator</dt>
                <dd>{data.operatorName}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      {/* Machinery Type Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Total Hours Used
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHours} hrs</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{totalCost.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Average Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{(totalCost / totalHours).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">per hour</p>
          </CardContent>
        </Card>
      </div>

      {/* Related Machinery Usage */}
      <Card>
        <CardHeader>
          <CardTitle>Usage History</CardTitle>
          <CardDescription>
            Other {data.type.replace(/_/g, " ").toLowerCase()} usage in this
            project
          </CardDescription>
        </CardHeader>
        <CardContent>
          {relatedMachinery.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No other usage records found
            </p>
          ) : (
            <div className="space-y-4">
              {relatedMachinery.map((machine) => (
                <div
                  key={machine.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                >
                  <div>
                    <div className="font-medium">
                      {formatDate(machine.date)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {machine.hoursUsed} hours
                      {machine.operatorName && ` • ${machine.operatorName}`}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      ₹{machine.totalCost.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ₹{machine.hourlyRate} per hour
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
