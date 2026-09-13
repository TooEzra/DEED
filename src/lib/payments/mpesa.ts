/**
 * M-Pesa Daraja API abstraction.
 * Credentials must come from environment variables — never expose to client.
 */

export interface StkPushRequest {
  amount: number;
  phone: string; // 2547XXXXXXXX
  accountReference: string;
  transactionDesc: string;
  callbackUrl?: string;
}

export interface StkPushResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}

export interface MpesaCallbackBody {
  Body: {
    stkCallback: {
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResultCode: number;
      ResultDesc: string;
      CallbackMetadata?: {
        Item: Array<{
          Name: string;
          Value?: string | number;
        }>;
      };
    };
  };
}

function getCredentials() {
  const consumerKey = process.env.MPESA_CONSUMER_KEY;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
  const passkey = process.env.MPESA_PASSKEY;
  const shortcode = process.env.MPESA_SHORTCODE;
  const env = process.env.MPESA_ENV || "sandbox";

  if (!consumerKey || !consumerSecret || !passkey || !shortcode) {
    throw new Error("M-Pesa credentials are not configured");
  }

  const baseUrl =
    env === "production"
      ? "https://api.safaricom.co.ke"
      : "https://sandbox.safaricom.co.ke";

  return { consumerKey, consumerSecret, passkey, shortcode, baseUrl };
}

async function getAccessToken(): Promise<string> {
  const { consumerKey, consumerSecret, baseUrl } = getCredentials();
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString(
    "base64"
  );

  const res = await fetch(
    `${baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
    {
      headers: { Authorization: `Basic ${auth}` },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to obtain M-Pesa access token");
  }

  const data = await res.json();
  return data.access_token;
}

function generatePassword(shortcode: string, passkey: string): {
  password: string;
  timestamp: string;
} {
  const timestamp = new Date()
    .toISOString()
    .replace(/[^0-9]/g, "")
    .slice(0, 14);
  const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString(
    "base64"
  );
  return { password, timestamp };
}

/**
 * Initiate STK Push. Does NOT mark payment as completed.
 * Completion happens only after validating the callback.
 */
export async function initiateStkPush(
  request: StkPushRequest
): Promise<StkPushResponse> {
  const { passkey, shortcode, baseUrl } = getCredentials();
  const accessToken = await getAccessToken();
  const { password, timestamp } = generatePassword(shortcode, passkey);

  const phone = request.phone.replace(/^0/, "254").replace(/^\+/, "");

  const payload = {
    BusinessShortCode: shortcode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: Math.round(request.amount),
    PartyA: phone,
    PartyB: shortcode,
    PhoneNumber: phone,
    CallBackURL:
      request.callbackUrl ||
      process.env.MPESA_CALLBACK_URL ||
      `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/mpesa/callback`,
    AccountReference: request.accountReference.slice(0, 12),
    TransactionDesc: request.transactionDesc.slice(0, 13),
  };

  const res = await fetch(`${baseUrl}/mpesa/stkpush/v1/processrequest`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok || data.ResponseCode !== "0") {
    throw new Error(
      data.errorMessage || data.ResponseDescription || "STK Push failed"
    );
  }

  return data as StkPushResponse;
}

/**
 * Extract useful fields from M-Pesa callback body.
 */
export function parseMpesaCallback(body: MpesaCallbackBody) {
  const cb = body.Body.stkCallback;
  const items = cb.CallbackMetadata?.Item || [];

  const get = (name: string) =>
    items.find((i) => i.Name === name)?.Value;

  return {
    merchantRequestId: cb.MerchantRequestID,
    checkoutRequestId: cb.CheckoutRequestID,
    resultCode: cb.ResultCode,
    resultDesc: cb.ResultDesc,
    success: cb.ResultCode === 0,
    amount: get("Amount") as number | undefined,
    mpesaReceiptNumber: get("MpesaReceiptNumber") as string | undefined,
    transactionDate: get("TransactionDate") as string | undefined,
    phoneNumber: get("PhoneNumber") as string | undefined,
  };
}
