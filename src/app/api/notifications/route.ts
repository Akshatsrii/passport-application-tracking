import { NextResponse } from "next/server";
import { db } from "@/lib/db/store";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get("applicationId") || undefined;

    const notifs = db.getNotifications(applicationId);
    return NextResponse.json({ success: true, count: notifs.length, data: notifs });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;
    if (!id) {
      return NextResponse.json({ success: false, error: "Notification id is required" }, { status: 400 });
    }

    db.markNotificationRead(id);
    return NextResponse.json({ success: true, message: `Notification ${id} marked as read.` });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
