import { NextResponse } from "next/server";
import { db } from "@/lib/db/store";
import { OperatorReviewSchema } from "@/lib/validations";
import { OperatorReviewRecord } from "@/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = OperatorReviewSchema.parse(body);

    const app = db.getApplication(validated.applicationId);
    if (!app) {
      return NextResponse.json(
        { success: false, error: `Application ${validated.applicationId} not found.` },
        { status: 404 }
      );
    }

    // Must be in UNDER_OPERATOR_REVIEW or SUBMITTED
    if (app.status === "SUBMITTED") {
      // Automatically transition to UNDER_OPERATOR_REVIEW first
      db.transitionStatus(
        app.id,
        "UNDER_OPERATOR_REVIEW",
        "OPERATOR",
        validated.operatorId,
        validated.operatorName,
        "Operator opened review console"
      );
    }

    const reviewRecord: OperatorReviewRecord = {
      id: `rev-${Date.now().toString().slice(-6)}`,
      applicationId: app.id,
      operatorId: validated.operatorId,
      operatorName: validated.operatorName,
      decision: validated.decision,
      remarks: validated.remarks,
      reviewedAt: new Date().toISOString(),
      checkedDocumentIds: validated.checkedDocumentIds,
    };

    app.operatorReviews.push(reviewRecord);
    db.updateApplication(app.id, { operatorReviews: app.operatorReviews });

    // Transition state
    const targetStatus = validated.decision; // "APPROVED" | "REJECTED" | "ADDITIONAL_INFO_REQUESTED"
    const updated = db.transitionStatus(
      app.id,
      targetStatus,
      "OPERATOR",
      validated.operatorId,
      validated.operatorName,
      validated.remarks,
      { reviewRecordId: reviewRecord.id, checkedDocsCount: validated.checkedDocumentIds.length }
    );

    return NextResponse.json({
      success: true,
      message: `Operator decision '${validated.decision}' applied successfully.`,
      data: updated,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to process operator review" },
      { status: 400 }
    );
  }
}
