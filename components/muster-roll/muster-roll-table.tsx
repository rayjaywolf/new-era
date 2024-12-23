'use client'

import { useState } from "react"
import { Worker, Attendance } from "@prisma/client"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface MusterRollTableProps {
    workers: (Worker & {
        attendance: Attendance[]
        assignments: {
            project: {
                projectId: string
            }
        }[]
    })[]
    date: string
}

export default function MusterRollTable({ workers, date }: MusterRollTableProps) {
    const [attendance, setAttendance] = useState<Record<string, { hoursWorked: string, overtime: string }>>({})
    const [loading, setLoading] = useState(false)

    // Initialize attendance state from existing data
    useState(() => {
        const initialAttendance: Record<string, { hoursWorked: string, overtime: string }> = {}
        workers.forEach(worker => {
            if (worker.attendance[0]) {
                initialAttendance[worker.id] = {
                    hoursWorked: worker.attendance[0].hoursWorked.toString(),
                    overtime: worker.attendance[0].overtime.toString()
                }
            } else {
                initialAttendance[worker.id] = { hoursWorked: '', overtime: '' }
            }
        })
        setAttendance(initialAttendance)
    }, [workers])

    // Calculate daily income for a worker
    const calculateDailyIncome = (worker: Worker, hoursWorked: string, overtime: string) => {
        const hours = parseFloat(hoursWorked) || 0
        const overtimeHours = parseFloat(overtime) || 0
        const totalHours = hours + overtimeHours
        return totalHours * worker.hourlyRate
    }

    async function handleSubmit() {
        try {
            setLoading(true)
            const response = await fetch('/api/attendance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    date,
                    attendance: Object.entries(attendance).map(([workerId, data]) => ({
                        workerId,
                        hoursWorked: parseFloat(data.hoursWorked) || 0,
                        overtime: parseFloat(data.overtime) || 0,
                    })),
                }),
            })

            if (!response.ok) throw new Error()
            toast.success('Attendance saved successfully')
        } catch (error) {
            toast.error('Failed to save attendance')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-4">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Project</TableHead>
                        <TableHead>Hours Worked</TableHead>
                        <TableHead>Overtime</TableHead>
                        <TableHead>Daily Income</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {workers.map((worker) => (
                        <TableRow key={worker.id}>
                            <TableCell>{worker.name}</TableCell>
                            <TableCell>{worker.type}</TableCell>
                            <TableCell>
                                {worker.assignments[0]?.project.projectId || 'Not Assigned'}
                            </TableCell>
                            <TableCell>
                                <Input
                                    type="number"
                                    min="0"
                                    max="24"
                                    step="0.5"
                                    value={attendance[worker.id]?.hoursWorked || ''}
                                    onChange={(e) => setAttendance(prev => ({
                                        ...prev,
                                        [worker.id]: {
                                            ...prev[worker.id],
                                            hoursWorked: e.target.value
                                        }
                                    }))}
                                    className="w-20"
                                />
                            </TableCell>
                            <TableCell>
                                <Input
                                    type="number"
                                    min="0"
                                    max="24"
                                    step="0.5"
                                    value={attendance[worker.id]?.overtime || ''}
                                    onChange={(e) => setAttendance(prev => ({
                                        ...prev,
                                        [worker.id]: {
                                            ...prev[worker.id],
                                            overtime: e.target.value
                                        }
                                    }))}
                                    className="w-20"
                                />
                            </TableCell>
                            <TableCell className="font-medium">
                                ₹{calculateDailyIncome(
                                    worker,
                                    attendance[worker.id]?.hoursWorked || '0',
                                    attendance[worker.id]?.overtime || '0'
                                ).toFixed(2)}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <div className="flex justify-end">
                <Button onClick={handleSubmit} disabled={loading}>
                    {loading ? 'Saving...' : 'Save Attendance'}
                </Button>
            </div>
        </div>
    )
} 