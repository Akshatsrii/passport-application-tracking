import crypto from "crypto";

export function sha256(data: string): string {
  return crypto.createHash("sha256").update(data).digest("hex");
}

export function generateConsentSignature(
  applicationId: string,
  aadhaarMasked: string,
  timestamp: string,
  scopes: string[]
): string {
  const secret = process.env.CONSENT_SIGNING_SECRET || "simulated-digilocker-consent-secret-key-2026";
  const payload = `${applicationId}:${aadhaarMasked}:${timestamp}:${scopes.sort().join(",")}`;
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

export function computeAuditChecksum(
  prevChecksum: string,
  action: string,
  actorId: string,
  timestamp: string,
  details: Record<string, any>
): string {
  const payload = `${prevChecksum}|${action}|${actorId}|${timestamp}|${JSON.stringify(details)}`;
  return sha256(payload);
}

export function maskAadhaar(aadhaar: string): string {
  const clean = aadhaar.replace(/\D/g, "");
  if (clean.length < 4) return "XXXX-XXXX-XXXX";
  const last4 = clean.slice(-4);
  return `XXXX-XXXX-${last4}`;
}

export function maskPhone(phone: string): string {
  const clean = phone.replace(/\D/g, "");
  if (clean.length < 4) return "+91-XXXXX-XXXX";
  const last4 = clean.slice(-4);
  return `+91-XXXXX-${last4}`;
}

export function maskEmail(email: string): string {
  const parts = email.split("@");
  if (parts.length !== 2) return "******@***.***";
  const [local, domain] = parts;
  if (local.length <= 2) {
    return `${local[0] || "*"}***@${domain}`;
  }
  const first = local[0];
  const last = local[local.length - 1];
  return `${first}${"*".repeat(Math.max(2, local.length - 2))}${last}@${domain}`;
}
