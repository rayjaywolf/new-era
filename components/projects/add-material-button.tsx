"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

interface AddMaterialButtonProps {
  projectId: string;
}

export default function AddMaterialButton({
  projectId,
}: AddMaterialButtonProps) {
  const router = useRouter();

  return (
    <Button
      onClick={() => router.push(`/projects/${projectId}/material/add`)}
      size="sm"
    >
      <Plus className="mr-2 h-4 w-4" />
      Add Material
    </Button>
  );
}
