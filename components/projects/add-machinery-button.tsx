import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface AddMachineryButtonProps {
  projectId: string;
}

export default function AddMachineryButton({
  projectId,
}: AddMachineryButtonProps) {
  return (
    <Link href={`/projects/${projectId}/machinery/add`}>
      <Button size="sm">
        <Plus className="mr-2 h-4 w-4" />
        Add Machinery
      </Button>
    </Link>
  );
}
