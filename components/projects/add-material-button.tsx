"use client"

import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

interface AddMaterialButtonProps {
    projectId: string
}

export default function AddMaterialButton({ projectId }: AddMaterialButtonProps) {
    const router = useRouter()

    return (
        <Button
            onClick={() => router.push(`/materials/create`)}
            variant="outline"
            size="sm"
            className="h-8"
        >
            <Plus className="mr-2 h-4 w-4" />
            Add Material
        </Button>
    )
}
