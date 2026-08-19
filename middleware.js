import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// ─── Route Matchers ───────────────────────────────────────
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

const isProtectedRoute = createRouteMatcher([
  "/interview(.*)",
  "/github-analysis(.*)",
  "/insights(.*)",
  "/progress(.*)",
  "/roadmaps(.*)",
  "/newones(.*)",
  "/hackathons(.*)",
]);

const isHODRoute      = createRouteMatcher(["/hod(.*)"]);
const isDirectorRoute = createRouteMatcher(["/director(.*)"]);
const isStudentRoute  = createRouteMatcher(["/student(.*)"]);

// ─── Role Extractor ───────────────────────────────────────
function getRole(sessionClaims) {
  return (
    sessionClaims?.role ||
    sessionClaims?.o?.rol ||
    sessionClaims?.publicMetadata?.role ||
    sessionClaims?.metadata?.role ||
    null
  );
}

// ─── Check if user is HOD ───────────────────────────────────────
function isHOD(sessionClaims, has) {
  const role = getRole(sessionClaims);
  const hasHODRole = has && has({ role: "org:hod" });
  return hasHODRole || role === "org:hod";
}

// ─── Middleware ───────────────────────────────────────────
export default clerkMiddleware(async (auth, req) => {
  const authData = await auth();
  const { userId, sessionClaims, has, redirectToSignIn } = authData;
  const path = req.nextUrl.pathname;

  // 1. Public routes — always allow
  if (isPublicRoute(req)) return NextResponse.next();

  // 2. Not signed in — redirect to sign in
  if (!userId) {
    if (
      isProtectedRoute(req) ||
      isHODRoute(req) ||
      isDirectorRoute(req) ||
      isStudentRoute(req)
    ) {
      return redirectToSignIn();
    }
    return NextResponse.next();
  }

  // 3. Check if user is HOD
  const userIsHOD = isHOD(sessionClaims, has);

  // 4. HOD ROLE ROUTING - Redirect HOD away from student pages
  if (userIsHOD) {
    // If HOD tries to access root or any student page, redirect to /hod
    if (path === "/" || isProtectedRoute(req) || isStudentRoute(req)) {
      return NextResponse.redirect(new URL("/hod", req.url));
    }
    
    // Allow HOD to access HOD routes
    if (isHODRoute(req)) {
      return NextResponse.next();
    }
    
    // For any other route HOD tries to access, redirect to /hod
    return NextResponse.redirect(new URL("/hod", req.url));
  }

  // 5. HOD ROUTES - Only HOD can access
  if (isHODRoute(req)) {
    // Non-HOD trying to access HOD routes
    return NextResponse.redirect(new URL("/", req.url));
  }

  // 6. DIRECTOR ROUTES
  if (isDirectorRoute(req)) {
    const hasDirectorRole = has && has({ role: "org:director" });
    const role = getRole(sessionClaims);
    
    if (!hasDirectorRole && role !== "org:director") {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  // 7. STUDENT ROUTES
  if (isStudentRoute(req)) {
    const hasStudentRole = has && has({ role: "org:student" });
    const role = getRole(sessionClaims);
    
    if (!hasStudentRole && role !== "org:student") {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }
  
  // 8. PROTECTED STUDENT ROUTES - Allow students/regular users
  if (isProtectedRoute(req)) {
    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};