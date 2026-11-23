import { NextResponse } from "next/server";
import { digiLockerAdapter } from "@/lib/digilocker/mock-adapter";

export async function GET() {
  try {
    const personas = digiLockerAdapter.getAvailableMockPersonas();
    return NextResponse.json({
      success: true,
      adapter: digiLockerAdapter.getAdapterName(),
      isMock: digiLockerAdapter.isMock(),
      data: personas,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
