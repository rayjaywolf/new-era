import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function ProjectNotFound() {
    return (
        <div className="container flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <h1 className="text-3xl font-bold">Project Not Found</h1>
            <p className="text-muted-foreground">
                The project you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
                <Link href="/projects">Back to Projects</Link>
            </Button>
        </div>
    )
} 