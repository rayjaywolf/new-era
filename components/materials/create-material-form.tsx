"use client"

import { useRouter } from "next/navigation"
import { MaterialType } from "@prisma/client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"

const formSchema = z.object({
    type: z.nativeEnum(MaterialType),
    currentRate: z.string().transform((val) => parseFloat(val)),
    dateAdded: z.string().transform((val) => new Date(val)),
})

interface CreateMaterialFormProps {
    unitMap: Record<MaterialType, string>
}

export default function CreateMaterialForm({ unitMap }: CreateMaterialFormProps) {
    const router = useRouter()
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            dateAdded: new Date().toISOString().split("T")[0],
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const response = await fetch("/api/materials", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...values,
                    unit: unitMap[values.type],
                }),
            })

            if (!response.ok) {
                throw new Error("Failed to create material")
            }

            router.push("/materials")
            router.refresh()
        } catch (error) {
            console.error("Error creating material:", error)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Type</FormLabel>
                            <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select material type" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {Object.entries(MaterialType).map(([key, value]) => (
                                        <SelectItem key={value} value={value}>
                                            {key.replace(/_/g, " ")} ({unitMap[value as MaterialType]})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="currentRate"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Current Rate (₹)</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="Enter current rate"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="dateAdded"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Date Added</FormLabel>
                            <FormControl>
                                <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit">Create Material</Button>
            </form>
        </Form>
    )
}
