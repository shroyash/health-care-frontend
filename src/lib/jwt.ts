import { importSPKI, jwtVerify } from "jose";

export async function verifyJWT(token: string) {
  try {
    const publicKeyPem = process.env.JWT_PUBLIC_KEY;

    if (!publicKeyPem) {
      throw new Error("JWT_PUBLIC_KEY not configured");
    }

    const publicKey = await importSPKI(publicKeyPem, "RS256");

    const { payload } = await jwtVerify(token, publicKey);

    // Extract userId from payload.sub
    const userId = payload.sub ? Number(payload.sub) : null;

    return {
      ...payload,
      userId,
    };
  } catch (err) {
    console.error("JWT verification failed:", err instanceof Error ? err.message : err);
    return null;
  }
}
