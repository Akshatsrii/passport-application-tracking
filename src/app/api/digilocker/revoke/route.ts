import { NextResponse } from "next/server";
import { db } from "@/lib/db/store";
import { digiLockerAdapter } from "@/lib/digilocker/mock-adapter";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { applicationId } = body;

    if (!applicationId) {
      return NextResponse.json({ success: false, error: "applicationId is required" }, { status: 400 });
    }

    const app = db.getApplication(applicationId);
    if (!app) {
      return NextResponse.json({ success: false, error: `Application ${applicationId} not found` }, { status: 404 });
    }

    await digiLockerAdapter.revokeConsent("token", app.applicantId);
    const updated = db.revokeConsent(applicationId, app.profile.fullName || "Applicant");

    return NextResponse.json({
      success: true,
      message: "DigiLocker consent has been successfully revoked and logged in the immutable audit trail.",
      data: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
