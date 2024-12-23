import { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import AddWorkerForm from "@/components/projects/add-worker-form"

interface AddWorkerPageProps {
    params: {
        id: string
    }
}

export const metadata: Metadata = {
    title: "Add Worker | New Era Construction",
    description: "Add a worker to the project",
}

async function getExistingWorkers() {
    return await prisma.worker.findMany({
        orderBy: {
            name: 'asc',
        },
    })
}

export default async function AddWorkerPage({ params }: AddWorkerPageProps) {
    const existingWorkers = await getExistingWorkers()

    return (
        <div className="container py-8">
            <h1 className="text-3xl font-bold mb-8">Add Worker to Project</h1>
            <div className="max-w-2xl">
                <AddWorkerForm projectId={params.id} existingWorkers={existingWorkers} />
            </div>
        </div>
    )
} 