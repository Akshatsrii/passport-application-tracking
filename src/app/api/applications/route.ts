import { NextResponse } from "next/server";
import { db } from "@/lib/db/store";
import { CreateApplicationSchema } from "@/lib/validations";
import { PassportApplication } from "@/types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const applicantId = searchParams.get("applicantId");

    let apps = db.getApplications();

    if (status) {
      apps = apps.filter((a) => a.status === status);
    }
    if (applicantId) {
      apps = apps.filter((a) => a.applicantId === applicantId);
    }

    // Sort by updatedAt descending
    apps.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    return NextResponse.json({ success: true, count: apps.length, data: apps });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = CreateApplicationSchema.parse(body);

    const now = new Date().toISOString();
    const appNumber = Math.floor(10000 + Math.random() * 90000);
    const id = `APP-2026-${appNumber}`;

    const newApp: PassportApplication = {
      id,
      applicantId: validated.applicantId,
      serviceType: validated.serviceType,
      bookletType: validated.bookletType,
      rpoLocation: validated.rpoLocation,
      status: "DRAFT",
      createdAt: now,
      updatedAt: now,
      profile: validated.profile,
      documents: [],
      operatorReviews: [],
      flags: {
        hasNameMismatch: false,
        hasDobMismatch: false,
        hasAddressMismatch: false,
        requiresManualVerification: false,
      },
    };

    const saved = db.createApplication(newApp);
    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.errors ? err.errors : err.message },
      { status: 400 }
    );
  }
}
