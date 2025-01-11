import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const existingMaterial = await prisma.materialUsage.findFirst({
      where: {
        projectId: params.id,
        type: body.type,
      },
    });

    let material;
    if (existingMaterial) {
      material = await prisma.materialUsage.update({
        where: {
          id: existingMaterial.id,
        },
        data: {
          volume: existingMaterial.volume + body.volume,
          cost: existingMaterial.cost + body.cost,
        },
      });
    } else {
      // Create new material if none exists
      material = await prisma.materialUsage.create({
        data: {
          projectId: params.id,
          type: body.type,
          volume: body.volume,
          cost: body.cost,
        },
      });
    }

    return NextResponse.json(material);
  } catch (error) {
    console.error("Failed to add material:", error);
    return NextResponse.json(
      { error: "Failed to add material" },
      { status: 500 }
    );
  }
}
