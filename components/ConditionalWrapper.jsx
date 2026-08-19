"use client";

import { usePathname } from "next/navigation";

export default function ConditionalWrapper({ children }) {
  const pathname = usePathname();
  
  // No padding on HOD pages (they have their own layout)
  const isHODPage = pathname?.startsWith('/hod');

  return (
    <div className={isHODPage ? "" : "pt-16"}>
      {children}
    </div>
  );
}
