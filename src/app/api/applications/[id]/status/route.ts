import { NextResponse } from "next/server";
import { db } from "@/lib/db/store";
import { StatusTransitionSchema } from "@/lib/validations";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const validated = StatusTransitionSchema.parse(body);

    const updated = db.transitionStatus(
      id,
      validated.toStatus,
      validated.actorRole,
      validated.actorId,
      validated.actorName,
      validated.notes,
      validated.additionalData
    );

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to transition state" },
      { status: 400 }
    );
  }
}
