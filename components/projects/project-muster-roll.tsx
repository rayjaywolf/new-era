'use client'

import { useState, useEffect } from "react"
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
import { DatePicker } from "@/components/ui/date-picker"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"

interface ProjectMusterRollProps {
    projectId: string
    workers: (Worker & {
        attendance: Attendance[]
    })[]
    date: string
    onAttendanceUpdate?: (attendance: Record<string, { present: boolean, hoursWorked: string, overtime: string }>) => void
}

export default function ProjectMusterRoll({ 
    projectId, 
    workers, 
    date,
    onAttendanceUpdate 
}: ProjectMusterRollProps) {
    const [attendance, setAttendance] = useState<Record<string, { present: boolean, hoursWorked: string, overtime: string }>>({})
    const [loading, setLoading] = useState(false)

    // Initialize attendance state from existing data
    useEffect(() => {
        const initialAttendance: Record<string, { present: boolean, hoursWorked: string, overtime: string }> = {}
        workers.forEach(worker => {
            if (worker.attendance[0]) {
                initialAttendance[worker.id] = {
                    present: worker.attendance[0].present,
                    hoursWorked: worker.attendance[0].hoursWorked.toString(),
                    overtime: worker.attendance[0].overtime.toString()
                }
            } else {
                initialAttendance[worker.id] = { present: false, hoursWorked: '0', overtime: '0' }
            }
        })
        setAttendance(initialAttendance)
        onAttendanceUpdate?.(initialAttendance)
    }, [workers, onAttendanceUpdate])

    // Update parent component whenever attendance changes
    useEffect(() => {
        onAttendanceUpdate?.(attendance)
    }, [attendance, onAttendanceUpdate])

    const updateAttendance = (workerId: string, data: Partial<{ present: boolean, hoursWorked: string, overtime: string }>) => {
        setAttendance(prev => {
            const newAttendance = {
                ...prev,
                [workerId]: {
                    ...prev[workerId],
                    ...data,
                    // Reset hours if marking not present
                    ...(data.present === false ? { hoursWorked: '0', overtime: '0' } : {})
                }
            }
            return newAttendance
        })
    }

    // Calculate daily income for a worker
    const calculateDailyIncome = (worker: Worker, present: boolean, hoursWorked: string, overtime: string) => {
        if (!present) return 0
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
                    projectId,
                    attendance: Object.entries(attendance).map(([workerId, data]) => ({
                        workerId,
                        present: data.present,
                        hoursWorked: data.present ? parseFloat(data.hoursWorked) || 0 : 0,
                        overtime: data.present ? parseFloat(data.overtime) || 0 : 0,
                    })),
                }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.details || 'Failed to save attendance')
            }
            
            toast.success('Attendance saved successfully')
        } catch (error) {
            console.error('Error saving attendance:', error)
            toast.error(error instanceof Error ? error.message : 'Failed to save attendance')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                    Date: {new Date(date).toLocaleDateString()}
                </div>
                <Button onClick={handleSubmit} disabled={loading}>
                    {loading ? 'Saving...' : 'Save Attendance'}
                </Button>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Present</TableHead>
                        <TableHead>Hours Worked</TableHead>
                        <TableHead>Overtime</TableHead>
                        <TableHead className="text-right">Daily Income</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {workers.map((worker) => {
                        const workerAttendance = attendance[worker.id] || { present: false, hoursWorked: '0', overtime: '0' }
                        return (
                            <TableRow key={worker.id}>
                                <TableCell>{worker.name}</TableCell>
                                <TableCell>{worker.type}</TableCell>
                                <TableCell>
                                    <Checkbox
                                        checked={workerAttendance.present}
                                        onCheckedChange={(checked) => updateAttendance(worker.id, { 
                                            present: checked as boolean 
                                        })}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Input
                                        type="number"
                                        min="0"
                                        max="24"
                                        step="0.5"
                                        value={workerAttendance.hoursWorked}
                                        onChange={(e) => updateAttendance(worker.id, { 
                                            hoursWorked: e.target.value 
                                        })}
                                        disabled={!workerAttendance.present}
                                        className="w-20"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Input
                                        type="number"
                                        min="0"
                                        max="24"
                                        step="0.5"
                                        value={workerAttendance.overtime}
                                        onChange={(e) => updateAttendance(worker.id, { 
                                            overtime: e.target.value 
                                        })}
                                        disabled={!workerAttendance.present}
                                        className="w-20"
                                    />
                                </TableCell>
                                <TableCell className="text-right">
                                    ₹{calculateDailyIncome(
                                        worker,
                                        workerAttendance.present,
                                        workerAttendance.hoursWorked,
                                        workerAttendance.overtime
                                    ).toFixed(2)}
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </div>
    )
}
