"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function RoleBasedRedirect() {
  const { userId, sessionClaims, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait for auth to load
    if (!isLoaded) return;

    // Not signed in, do nothing
    if (!userId) return;

    // Check if user is HOD
    const role = sessionClaims?.role || 
                 sessionClaims?.publicMetadata?.role || 
                 sessionClaims?.metadata?.role;

    // Redirect HOD to /hod immediately
    if (role === "org:hod") {
      router.replace("/hod");
    }
  }, [isLoaded, userId, sessionClaims, router]);

  return null; // This component doesn't render anything
}
