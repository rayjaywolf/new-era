import { Metadata } from "next"
import CreateProjectForm from "@/components/projects/create-project-form"

export const metadata: Metadata = {
    title: "Create Project | New Era Construction",
    description: "Create a new construction project",
}

export default function CreateProjectPage() {
    return (
        <div className="container py-8">
            <h1 className="text-3xl font-bold mb-8">Create New Project</h1>
            <div className="max-w-2xl">
                <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
                    <CreateProjectForm />
                </Card>
            </div>
        </div>
    )
} 