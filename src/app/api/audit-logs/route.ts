import { NextResponse } from "next/server";
import { db } from "@/lib/db/store";
import { computeAuditChecksum } from "@/lib/utils/crypto";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get("applicationId") || undefined;

    const logs = db.getAuditLogs(applicationId);

    // Verify hash chaining integrity across all returned logs
    let chainValid = true;
    let corruptedLogId: string | null = null;

    for (let i = 0; i < logs.length; i++) {
      const current = logs[i];
      const prevChecksum = current.prevChecksum || "0000000000000000000000000000000000000000000000000000000000000000";
      const expectedChecksum = computeAuditChecksum(
        prevChecksum,
        current.action,
        current.actorId,
        current.timestamp,
        current.details
      );

      // Verify that checksum matches
      if (current.checksum !== expectedChecksum) {
        chainValid = false;
        corruptedLogId = current.id;
        break;
      }
    }

    return NextResponse.json({
      success: true,
      count: logs.length,
      integrity: {
        isChainIntact: chainValid,
        verifiedRecordsCount: logs.length,
        corruptedLogId,
        algorithm: "SHA-256 Chained Hash Sequence",
      },
      data: logs.reverse(), // most recent first
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
