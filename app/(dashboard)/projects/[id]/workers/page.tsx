import { prisma } from "@/lib/prisma";
import ProjectWorkers from "./ProjectWorkers"; // Ensure this path is correct

interface ProjectWorkersPageProps {
  params: {
    id: string; // Project ID
  };
}

async function getProjectWorkers(projectId: string) {
  return await prisma.workerAssignment.findMany({
    where: { projectId },
    include: {
      worker: true,
    },
    orderBy: {
      worker: {
        name: "asc",
      },
    },
  });
}

export default async function ProjectWorkersPage({ params }: ProjectWorkersPageProps) {
  const workers = await getProjectWorkers(params.id); // Fetch workers data

  return <ProjectWorkers workers={workers} projectId={params.id} />; // Pass data to Client Component
} 