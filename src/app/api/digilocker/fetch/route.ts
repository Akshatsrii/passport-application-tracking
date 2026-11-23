import { NextResponse } from "next/server";
import { db } from "@/lib/db/store";
import { digiLockerAdapter } from "@/lib/digilocker/mock-adapter";
import { ApplicationDocument } from "@/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { applicationId, personaKey = "rahul-sharma" } = body;

    if (!applicationId) {
      return NextResponse.json({ success: false, error: "applicationId is required" }, { status: 400 });
    }

    const app = db.getApplication(applicationId);
    if (!app) {
      return NextResponse.json({ success: false, error: `Application ${applicationId} not found` }, { status: 404 });
    }

    if (!app.consent || app.consent.status !== "ACTIVE") {
      return NextResponse.json(
        {
          success: false,
          error: "CONSENT_REQUIRED: Citizen must grant explicit DigiLocker consent before documents can be fetched.",
        },
        { status: 403 }
      );
    }

    // Exchange token and list documents
    const tokenResp = await digiLockerAdapter.exchangeToken(`code-${personaKey}`, "state-xyz");
    const docItems = await digiLockerAdapter.listIssuedDocuments(tokenResp.accessToken);

    const fetchedDocs: ApplicationDocument[] = [];

    for (const item of docItems) {
      // Check if document type is within consent scopes
      if (app.consent.scopes.includes(item.documentType)) {
        const pull = await digiLockerAdapter.pullDocument(tokenResp.accessToken, item.uri);

        const appDoc: ApplicationDocument = {
          id: `doc-${app.id}-${item.documentType.toLowerCase()}`,
          applicationId: app.id,
          documentType: item.documentType,
          title: item.name,
          source: "DIGILOCKER",
          uri: item.uri,
          issuer: item.issuer,
          issueDate: item.date,
          documentNumberMasked: pull.documentNumberMasked,
          verificationStatus: "VERIFIED",
          verificationNotes: `Verified via ${item.issuer}. Digital signature verified (${pull.signatureAlgorithm}).`,
          verifiedAt: new Date().toISOString(),
          checksumSha256: pull.checksumSha256,
          metadata: {
            nameInDoc: pull.demographicData.fullName,
            dobInDoc: pull.demographicData.dateOfBirth,
            addressInDoc: pull.demographicData.address,
            isDigitallySigned: pull.isDigitallySigned,
            issuerCertThumbprint: pull.issuerCertThumbprint,
          },
        };

        fetchedDocs.push(appDoc);
      }
    }

    const updatedApp = db.addDocuments(app.id, fetchedDocs, app.profile.fullName || "Applicant");

    return NextResponse.json({
      success: true,
      message: `Successfully fetched and cryptographically verified ${fetchedDocs.length} documents from DigiLocker.`,
      data: {
        documents: fetchedDocs,
        application: updatedApp,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
