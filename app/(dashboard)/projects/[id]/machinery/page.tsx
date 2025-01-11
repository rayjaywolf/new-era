import { notFound } from "next/navigation";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AddMachineryButton from "@/components/projects/add-machinery-button";
import Link from "next/link"; // Import Link for navigation

interface ProjectMachineryPageProps {
  params: {
    id: string; // Project ID
  };
}

export const metadata: Metadata = {
  title: "Machinery | New Era Construction",
  description: "View and manage machinery for the project",
};

async function getProjectMachinery(projectId: string) {
  return await prisma.machineryUsage.findMany({
    where: { projectId },
    orderBy: { date: "desc" },
  });
}

export default async function ProjectMachineryPage({ params }: ProjectMachineryPageProps) {
  const machinery = await getProjectMachinery(params.id);

  if (!machinery) {
    notFound();
  }

  return (
    <div className="container">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Machinery</h1>
        <AddMachineryButton projectId={params.id} />
      </div>

      {machinery.length === 0 ? (
        <p className="text-muted-foreground">No machinery found for this project.</p>
      ) : (
        <div className="grid gap-4">
          {machinery.map((item) => (
            <Link key={item.id} href={`/projects/${params.id}/machinery/${item.id}`}>
              <Card className="bg-white shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{item.type.replace(/_/g, " ")}</CardTitle>
                      <Badge>{formatDate(item.date)}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <dl className="grid gap-2">
                    <div>
                      <dt className="font-medium">Hours Used</dt>
                      <dd>{item.hoursUsed} hours</dd>
                    </div>
                    <div>
                      <dt className="font-medium">Total Cost</dt>
                      <dd>₹{item.totalCost.toLocaleString()}</dd>
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