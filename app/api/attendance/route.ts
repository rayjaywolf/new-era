import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { date, attendance } = body

        // Use transaction to ensure all operations succeed or none do
        await prisma.$transaction(
            attendance.map(({ workerId, hoursWorked, overtime }: any) =>
                prisma.attendance.upsert({
                    where: {
                        workerId_date: {
                            workerId,
                            date: new Date(date),
                        },
                    },
                    update: {
                        hoursWorked,
                        overtime,
                    },
                    create: {
                        workerId,
                        date: new Date(date),
                        hoursWorked,
                        overtime,
                    },
                })
            )
        )

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to save attendance" },
            { status: 500 }
        )
    }
} 