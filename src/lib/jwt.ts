import { importSPKI, jwtVerify } from "jose";

export async function verifyJWT(token: string) {
  try {
    const publicKeyPem = process.env.JWT_PUBLIC_KEY;

    if (!publicKeyPem) {
      throw new Error("JWT_PUBLIC_KEY not configured");
    }

    // Import the PEM public key properly
    const publicKey = await importSPKI(publicKeyPem, "RS256");

    // Verify the JWT
    const { payload } = await jwtVerify(token, publicKey);

    return payload;
  } catch (err) {
    console.error("JWT verification failed:", err instanceof Error ? err.message : err);
    return null;
  }
}
