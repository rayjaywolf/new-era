'use client'

import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import { useRouter } from "next/navigation"

export default function CreateProjectButton() {
    const router = useRouter()

    return (
        <Button
            onClick={() => router.push('/projects/create')}
            className="flex items-center gap-2"
        >
            <PlusIcon className="w-4 h-4" />
            Create Project
        </Button>
    )
} 