import { NextResponse } from "next/server";
import { db } from "@/lib/db/store";
import { DigiLockerConsentSchema } from "@/lib/validations";
import { generateConsentSignature } from "@/lib/utils/crypto";
import { ConsentArtifact } from "@/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = DigiLockerConsentSchema.parse(body);

    const app = db.getApplication(validated.applicationId);
    if (!app) {
      return NextResponse.json(
        { success: false, error: `Application ${validated.applicationId} not found.` },
        { status: 404 }
      );
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + validated.validityMinutes * 60 * 1000);
    const grantedAtIso = now.toISOString();

    const signature = generateConsentSignature(
      app.id,
      validated.citizenAadhaarMasked,
      grantedAtIso,
      validated.scopes
    );

    const consent: ConsentArtifact = {
      id: `cst-${app.id}-${Date.now().toString().slice(-6)}`,
      applicationId: app.id,
      citizenAadhaarMasked: validated.citizenAadhaarMasked,
      purpose: validated.purpose,
      scopes: validated.scopes,
      validityMinutes: validated.validityMinutes,
      grantedAt: grantedAtIso,
      expiresAt: expiresAt.toISOString(),
      status: "ACTIVE",
      ipAddress: "192.168.1.102 (Simulated Citizen Session)",
      consentSignature: signature,
    };

    const updatedApp = db.setConsent(app.id, consent, app.profile.fullName || "Applicant");

    return NextResponse.json({
      success: true,
      data: {
        consent,
        application: updatedApp,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to register DigiLocker consent" },
      { status: 400 }
    );
  }
}
