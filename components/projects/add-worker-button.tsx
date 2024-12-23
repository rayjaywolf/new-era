'use client'

import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import { useRouter } from "next/navigation"

interface AddWorkerButtonProps {
    projectId: string
}

export default function AddWorkerButton({ projectId }: AddWorkerButtonProps) {
    const router = useRouter()

    return (
        <Button
            onClick={() => router.push(`/projects/${projectId}/workers/add`)}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
        >
            <PlusIcon className="w-4 h-4" />
            Add Worker
        </Button>
    )
} 