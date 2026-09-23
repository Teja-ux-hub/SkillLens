import { NextResponse } from "next/server";

/**
 * Validates if the current local time is within the allowed 12-hour window:
 * 12:00 PM (12:00) to 12:00 AM (00:00 / midnight).
 */
export function isExamWindowOpen() {
  const now = new Date();
  const currentHour = now.getHours(); // 0 to 23
  // Open between 12:00 PM (12:00) and 12:00 AM (00:00 midnight)
  return currentHour >= 12 && currentHour < 24;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const force = searchParams.get("force") === "true"; // For dev/testing override if desired

    const isOpen = isExamWindowOpen() || force;
    const now = new Date();
    const currentHour = now.getHours();

    return NextResponse.json({
      available: isOpen,
      isOpen: isOpen,
      currentHour,
      message: isOpen
        ? "Weekly exam window is active (12 PM - 12 AM)."
        : "Weekly exam is available only between 12 PM and 12 AM.",
      windowDetails: {
        startTime: "12:00 PM (12:00)",
        endTime: "12:00 AM (00:00)",
        currentServerTime: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
