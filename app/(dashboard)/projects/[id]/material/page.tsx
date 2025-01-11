import { notFound } from "next/navigation";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { getMaterialUnit } from "@/lib/utils/materials";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AddMaterialButton from "@/components/projects/add-material-button";
import Link from "next/link";

interface ProjectMaterialPageProps {
  params: {
    id: string; // Project ID
  };
}

export const metadata: Metadata = {
  title: "Materials | New Era Construction",
  description: "View and manage materials for the project",
};

async function getProjectMaterials(projectId: string) {
  return await prisma.materialUsage.findMany({
    where: { projectId },
    orderBy: { date: "desc" },
  });
}

export default async function ProjectMaterialPage({ params }: ProjectMaterialPageProps) {
  const materials = await getProjectMaterials(params.id);

  if (!materials) {
    notFound();
  }

  return (
    <div className="container">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Materials</h1>
        <AddMaterialButton projectId={params.id} />
      </div>

      {materials.length === 0 ? (
        <p className="text-muted-foreground">No materials found for this project.</p>
      ) : (
        <div className="grid gap-4">
          {materials.map((material) => (
            <Link key={material.id} href={`/projects/${params.id}/material/${material.id}`}>
              <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{material.type.replace(/_/g, " ")}</CardTitle>
                      <Badge>{formatDate(material.date)}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <dl className="grid gap-2">
                    <div>
                      <dt className="font-medium">Volume</dt>
                      <dd>{material.volume} {getMaterialUnit(material.type)}</dd>
                    </div>
                    <div>
                      <dt className="font-medium">Cost</dt>
                      <dd>₹{material.cost.toLocaleString()}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
} 