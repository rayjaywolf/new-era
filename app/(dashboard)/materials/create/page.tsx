import { Metadata } from "next"
import { MaterialType } from "@prisma/client"
import CreateMaterialForm from "@/components/materials/create-material-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
    title: "Create Material | New Era Construction",
    description: "Create a new material",
}

const unitMap = {
    [MaterialType.STEEL]: "kg",
    [MaterialType.CEMENT]: "kg",
    [MaterialType.SAND]: "cubic feet",
    [MaterialType.GRIT_10MM]: "cubic feet",
    [MaterialType.GRIT_20MM]: "cubic feet",
    [MaterialType.GRIT_40MM]: "cubic feet",
    [MaterialType.BRICK]: "number",
    [MaterialType.STONE]: "cubic feet",
    [MaterialType.WATER]: "litre",
}

export default function CreateMaterialPage() {
    return (
        <div className="container py-8">
            <Card>
                <CardHeader>
                    <CardTitle>Create Material</CardTitle>
                    <CardDescription>Add a new material to the system</CardDescription>
                </CardHeader>
                <CardContent>
                    <CreateMaterialForm unitMap={unitMap} />
                </CardContent>
            </Card>
        </div>
    )
}
