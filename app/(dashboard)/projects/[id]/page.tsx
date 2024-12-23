import { notFound } from "next/navigation"
import { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import AddWorkerButton from "@/components/projects/add-worker-button"
import AddMaterialButton from "@/components/projects/add-material-button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import ProjectMusterRoll from "@/components/projects/project-muster-roll"

interface ProjectPageProps {
    params: {
        id: string
    }
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
    const project = await getProject(params.id)

    if (!project) {
        return {
            title: "Project Not Found",
        }
    }

    return {
        title: `${project.projectId} | New Era Construction`,
        description: `Project details for ${project.projectId}`,
    }
}

async function getProject(id: string) {
    const today = new Date().toISOString().split('T')[0]

    return await prisma.project.findUnique({
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
                                    }
                                }
                            }
                        }
                    }
                }
            },
            materials: {
                include: {
                    material: true,
                },
            },
            machinery: {
                include: {
                    machinery: true,
                },
            },
        },
    })
}

export default async function ProjectPage({ params }: ProjectPageProps) {
    const project = await getProject(params.id)

    if (!project) {
        notFound()
    }

    return (
        <div className="container py-8">
            <div className="grid gap-6">
                {/* Project Overview Card */}
                <Card>
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
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Workers</CardTitle>
                                <CardDescription>Workers assigned to this project</CardDescription>
                            </div>
                            <AddWorkerButton projectId={project.id} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        {project.workers.length === 0 ? (
                            <p className="text-muted-foreground">No workers assigned yet</p>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {project.workers.map((assignment) => (
                                    <div key={assignment.worker.id} className="space-y-1">
                                        <p className="font-medium">{assignment.worker.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {assignment.worker.type}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Materials Section */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Materials</CardTitle>
                                <CardDescription>Materials used in this project</CardDescription>
                            </div>
                            <AddMaterialButton projectId={project.id} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        {project.materials.length === 0 ? (
                            <p className="text-muted-foreground">No materials used yet</p>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {project.materials.map((usage) => (
                                    <div key={usage.id} className="space-y-1">
                                        <p className="font-medium">{usage.material.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            Quantity: {usage.quantity} {usage.material.unit}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Rate: ₹{usage.rate}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Machinery Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Machinery</CardTitle>
                        <CardDescription>Machinery used in this project</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {project.machinery.length === 0 ? (
                            <p className="text-muted-foreground">No machinery used yet</p>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {project.machinery.map((usage) => (
                                    <div key={usage.id} className="space-y-1">
                                        <p className="font-medium">{usage.machinery.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            Type: {usage.machinery.type} - {usage.machinery.subtype}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Hours Used: {usage.hoursUsed}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="mt-8">
                    <CardHeader>
                        <CardTitle>Daily Attendance</CardTitle>
                        <CardDescription>Track workers' attendance and hours</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ProjectMusterRoll
                            projectId={project.id}
                            workers={project.workers.map(assignment => ({
                                ...assignment.worker,
                                attendance: assignment.worker.attendance
                            }))}
                            date={new Date().toISOString().split('T')[0]}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
} 