import { NextRequest, NextResponse } from "next/server";
import { processMpesaCallback } from "@/services/payment.service";
import type { MpesaCallbackBody } from "@/lib/payments/mpesa";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as MpesaCallbackBody;
    await processMpesaCallback(body);
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  } catch (error) {
    console.error("M-Pesa callback error:", error);
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }
}
