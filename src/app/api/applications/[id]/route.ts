import { NextResponse } from "next/server";
import { db } from "@/lib/db/store";
import { getAllowedTransitions } from "@/lib/state-machine/transitions";
import { ActorRole } from "@/types";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const role = (searchParams.get("role") as ActorRole) || "APPLICANT";

    const app = db.getApplication(id);
    if (!app) {
      return NextResponse.json({ success: false, error: `Application ${id} not found.` }, { status: 404 });
    }

    const allowedTransitions = getAllowedTransitions(app, role);

    return NextResponse.json({
      success: true,
      data: {
        ...app,
        allowedTransitions,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const app = db.getApplication(id);
    if (!app) {
      return NextResponse.json({ success: false, error: `Application ${id} not found.` }, { status: 404 });
    }

    if (app.status !== "DRAFT" && app.status !== "ADDITIONAL_INFO_REQUESTED") {
      return NextResponse.json(
        { success: false, error: `Profile cannot be edited when application is in '${app.status}' status.` },
        { status: 400 }
      );
    }

    const updated = db.updateApplication(id, {
      profile: {
        ...app.profile,
        ...body.profile,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
