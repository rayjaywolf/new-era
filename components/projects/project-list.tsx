import { Project } from "@prisma/client"
import { formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card"
import Link from "next/link"

interface ProjectListProps {
    projects: Project[]
}

export default function ProjectList({ projects }: ProjectListProps) {
    if (projects.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground">No projects found</p>
            </div>
        )
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
                <Link href={`/projects/${project.id}`} className="block transition-opacity hover:opacity-70">
                    <Card key={project.id}>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>{project.projectId}</CardTitle>
                                <Badge>{project.status.toLowerCase()}</Badge>
                            </div>
                            <CardDescription>{project.clientName}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 text-sm">
                                <div>
                                    <span className="font-medium">Location:</span> {project.location}
                                </div>
                                <div>
                                    <span className="font-medium">Start Date:</span>{" "}
                                    {formatDate(project.startDate)}
                                </div>
                                {project.endDate && (
                                    <div>
                                        <span className="font-medium">End Date:</span>{" "}
                                        {formatDate(project.endDate)}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </div>
    )
} 