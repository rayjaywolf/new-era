import { notFound } from "next/navigation";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { getMaterialUnit } from "@/lib/utils/materials";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ProjectMaterialPageProps {
  params: {
    id: string;        // Project ID
    materialId: string; // Material Usage ID
  };
}

export async function generateMetadata({
  params,
}: ProjectMaterialPageProps): Promise<Metadata> {
  const data = await getProjectMaterialData(params.id, params.materialId);

  if (!data) {
    return {
      title: "Material Not Found",
    };
  }

  return {
    title: `${data.type} - ${data.project.projectId} | New Era Construction`,
    description: `Material usage details for ${data.type} in project ${data.project.projectId}`,
  };
}

async function getProjectMaterialData(projectId: string, materialId: string) {
  const material = await prisma.materialUsage.findFirst({
    where: {
      id: materialId,
      projectId: projectId,
    },
    include: {
      project: true,
    },
  });

  if (!material) return null;

  // Get all materials of the same type in this project
  const relatedMaterials = await prisma.materialUsage.findMany({
    where: {
      projectId: projectId,
      type: material.type,
    },
    orderBy: {
      date: "desc",
    },
  });

  return {
    ...material,
    relatedMaterials,
  };
}

export default async function ProjectMaterialPage({
  params,
}: ProjectMaterialPageProps) {
  const data = await getProjectMaterialData(params.id, params.materialId);

  if (!data) {
    notFound();
  }

  const { project, relatedMaterials } = data;

  // Calculate total usage of this material type in the project
  const totalVolume = relatedMaterials.reduce(
    (sum, mat) => sum + mat.volume,
    0
  );
  const totalCost = relatedMaterials.reduce(
    (sum, mat) => sum + mat.cost,
    0
  );

  return (
    <div className="space-y-6">
      {/* Material Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{data.type.replace(/_/g, " ")}</CardTitle>
              <CardDescription>{project.projectId}</CardDescription>
            </div>
            <Badge>{formatDate(data.date)}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 sm:grid-cols-3">
            <div>
              <dt className="font-medium">Volume</dt>
              <dd>
                {data.volume} {getMaterialUnit(data.type)}
              </dd>
            </div>
            <div>
              <dt className="font-medium">Cost</dt>
              <dd>₹{data.cost.toLocaleString()}</dd>
            </div>
            <div>
              <dt className="font-medium">Rate</dt>
              <dd>₹{(data.cost / data.volume).toFixed(2)} per {getMaterialUnit(data.type)}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Material Type Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Volume Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalVolume.toLocaleString()} {getMaterialUnit(data.type)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalCost.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Average Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{(totalCost / totalVolume).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              per {getMaterialUnit(data.type)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Usage History */}
      <Card>
        <CardHeader>
          <CardTitle>Usage History</CardTitle>
          <CardDescription>
            All {data.type.replace(/_/g, " ").toLowerCase()} usage in this project
          </CardDescription>
        </CardHeader>
        <CardContent>
          {relatedMaterials.length === 0 ? (
            <p className="text-sm text-muted-foreground">No usage records found</p>
          ) : (
            <div className="space-y-4">
              {relatedMaterials.map((material) => (
                <div
                  key={material.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                >
                  <div>
                    <div className="font-medium">{formatDate(material.date)}</div>
                    <div className="text-sm text-muted-foreground">
                      {material.volume} {getMaterialUnit(material.type)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">₹{material.cost.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">
                      ₹{(material.cost / material.volume).toFixed(2)} per {getMaterialUnit(material.type)}
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
