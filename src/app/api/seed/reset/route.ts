import { NextResponse } from "next/server";
import { db } from "@/lib/db/store";

export async function POST() {
  try {
    db.resetToSeed();
    return NextResponse.json({
      success: true,
      message: "Database successfully reset to initial demo state with Rahul Sharma and Priya Patel applications.",
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
