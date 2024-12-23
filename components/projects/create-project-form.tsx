'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
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
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

const projectSchema = z.object({
    projectId: z.string().min(1, "Project ID is required"),
    clientName: z.string().min(1, "Client name is required"),
    location: z.string().min(1, "Location is required"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().optional(),
})

export default function CreateProjectForm() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const form = useForm<z.infer<typeof projectSchema>>({
        resolver: zodResolver(projectSchema),
        defaultValues: {
            projectId: "",
            clientName: "",
            location: "",
            startDate: "",
            endDate: "",
        },
    })

    async function onSubmit(values: z.infer<typeof projectSchema>) {
        try {
            setLoading(true)
            const response = await fetch("/api/projects", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(values),
            })

            if (!response.ok) {
                throw new Error("Failed to create project")
            }

            toast.success("Project created successfully")
            router.push("/projects")
            router.refresh()
        } catch (error) {
            toast.error("Failed to create project")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="projectId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Project ID</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter project ID" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="clientName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Client Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter client name" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter project location" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Start Date</FormLabel>
                            <FormControl>
                                <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>End Date (Optional)</FormLabel>
                            <FormControl>
                                <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={loading}>
                    {loading ? "Creating..." : "Create Project"}
                </Button>
            </form>
        </Form>
    )
} 