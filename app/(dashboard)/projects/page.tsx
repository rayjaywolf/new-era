import { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import ProjectList from "@/components/projects/project-list"
import CreateProjectButton from "@/components/projects/create-project-button"

export const metadata: Metadata = {
    title: "Projects | New Era Construction",
    description: "Manage your construction projects",
}

async function getProjects() {
    return await prisma.project.findMany({
        orderBy: {
            createdAt: 'desc'
        }
    })
}

export default async function ProjectsPage() {
    const projects = await getProjects()

    return (
        <div className="container py-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">Projects</h1>
                <CreateProjectButton />
            </div>
            <ProjectList projects={projects} />
        </div>
    )
}
