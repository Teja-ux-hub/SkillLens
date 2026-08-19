import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const authData = await auth();
    const { userId, orgId, orgRole, has, sessionClaims } = authData || {};

    // Extract all possible metadata locations
    const debugInfo = {
      userId,
      orgId, // Organization ID
      nativeOrgRole: orgRole, // Native Clerk organization role
      hasSessionClaims: !!sessionClaims,
      publicMetadata: sessionClaims?.publicMetadata || null,
      metadata: sessionClaims?.metadata || null,
      unsafeMetadata: sessionClaims?.unsafeMetadata || null,
      customRoleClaim: sessionClaims?.role || null, // Custom claim from JWT template
      orgRoleFromClaims: sessionClaims?.o?.rol || null, // Alternative org role location
      hasHODRole: has ? has({ role: "org:hod" }) : null, // Clerk's has() method
      hasDirectorRole: has ? has({ role: "org:director" }) : null,
      hasStudentRole: has ? has({ role: "org:student" }) : null,
      fullSessionClaims: sessionClaims ? Object.keys(sessionClaims) : [],
      allSessionClaimsDebug: sessionClaims || null, // Show everything for debugging
    };

    return NextResponse.json(debugInfo, { status: 200 });
  } catch (error) {
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}
