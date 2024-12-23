'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Worker, WorkerType } from "@prisma/client"
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
import { toast } from "sonner"

const workerSchema = z.object({
    workerId: z.string().optional(),
    name: z.string().min(1, "Name is required"),
    type: z.nativeEnum(WorkerType),
    hourlyRate: z.string().min(1, "Hourly rate is required"),
    phoneNumber: z.string().optional(),
})

interface AddWorkerFormProps {
    projectId: string
    existingWorkers: Worker[]
}

export default function AddWorkerForm({ projectId, existingWorkers }: AddWorkerFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [isExistingWorker, setIsExistingWorker] = useState(false)

    const form = useForm<z.infer<typeof workerSchema>>({
        resolver: zodResolver(workerSchema),
        defaultValues: {
            name: "",
            hourlyRate: "",
            phoneNumber: "",
        },
    })

    async function onSubmit(values: z.infer<typeof workerSchema>) {
        try {
            setLoading(true)
            const response = await fetch(`/api/projects/${projectId}/workers`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...values,
                    hourlyRate: parseFloat(values.hourlyRate),
                    isExisting: isExistingWorker,
                }),
            })

            if (!response.ok) {
                throw new Error("Failed to add worker")
            }

            toast.success("Worker added successfully")
            router.push(`/projects/${projectId}`)
            router.refresh()
        } catch (error) {
            toast.error("Failed to add worker")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button
                        type="button"
                        variant={isExistingWorker ? "default" : "outline"}
                        onClick={() => setIsExistingWorker(true)}
                    >
                        Existing Worker
                    </Button>
                    <Button
                        type="button"
                        variant={!isExistingWorker ? "default" : "outline"}
                        onClick={() => setIsExistingWorker(false)}
                    >
                        New Worker
                    </Button>
                </div>

                {isExistingWorker ? (
                    <FormField
                        control={form.control}
                        name="workerId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Select Worker</FormLabel>
                                <Select onValueChange={field.onChange}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a worker" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {existingWorkers.map((worker) => (
                                            <SelectItem key={worker.id} value={worker.id}>
                                                {worker.name} - {worker.type}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                ) : (
                    <>
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter worker name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Type</FormLabel>
                                    <Select onValueChange={field.onChange}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select worker type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {Object.values(WorkerType).map((type) => (
                                                <SelectItem key={type} value={type}>
                                                    {type}
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
                            name="hourlyRate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Hourly Rate</FormLabel>
                                    <FormControl>
                                        <Input type="number" step="0.01" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="phoneNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone Number (Optional)</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </>
                )}
                <Button type="submit" disabled={loading}>
                    {loading ? "Adding..." : "Add Worker"}
                </Button>
            </form>
        </Form>
    )
} 