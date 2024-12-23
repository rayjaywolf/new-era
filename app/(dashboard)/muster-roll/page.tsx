import { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { formatDate } from "@/lib/utils"
import MusterRollTable from "@/components/muster-roll/muster-roll-table"
import { DatePicker } from "@/components/ui/date-picker"

export const metadata: Metadata = {
    title: "Muster Roll | New Era Construction",
    description: "Daily attendance and working hours of workers",
}

async function getAttendanceData(date: string) {
    const workers = await prisma.worker.findMany({
        where: {
            assignments: {
                some: {
                    endDate: null, // Only currently assigned workers
                }
            }
        },
        include: {
            attendance: {
                where: {
                    date: {
                        equals: new Date(date),
                    }
                }
            },
            assignments: {
                include: {
                    project: true
                }
            }
        },
        orderBy: {
            name: 'asc'
        }
    })

    return workers
}

export default async function MusterRollPage({
    searchParams,
}: {
    searchParams: { date?: string }
}) {
    const date = searchParams.date || new Date().toISOString().split('T')[0]
    const workers = await getAttendanceData(date)

    return (
        <div className="container py-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">Muster Roll</h1>
                <DatePicker date={date} />
            </div>
            <MusterRollTable workers={workers} date={date} />
        </div>
    )
} 