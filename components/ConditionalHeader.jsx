"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import SaveUser from './saveUser';
import {
  BriefcaseBusiness,
  BarChart3,
  MessageSquareCode,
  GraduationCap,
  ChevronDown,
  StarsIcon,
} from "lucide-react";
import { Button } from './ui/button';

export default function ConditionalHeader() {
  const pathname = usePathname();
  
  // Hide header on HOD pages (they have their own navigation)
  if (pathname?.startsWith('/hod')) {
    return null;
  }

  return (
    <>
      <style>
        {`
          @keyframes spin-slow {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .spin-slow {
            animation: spin-slow 6s linear infinite;
          }
        `}
      </style>
      <header className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-transparent border-b border-white/10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-white font-bold text-lg">SkillLens</Link>

          {/* Navigation */}
          <div className="flex items-center gap-3">
            <SignedIn>
              <SaveUser />
              {/* Progress Button */}
              <Link href="/progress">
                <Button
                  variant="ghost"
                  className="hover:border-cyan-400 border border-transparent text-white transition-colors duration-200"
                >
                  Track Progress
                </Button>
              </Link>

              {/* Growth Tools Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 text-white hover:border-fuchsia-500 border border-transparent transition-colors"
                  >
                    <StarsIcon className="h-4 w-4 spin-slow" />
                    <span className="hidden md:block">Growth Tools</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-[#181926] text-white border border-white/10 shadow-xl">
                  <DropdownMenuItem asChild>
                    <Link href="/roadmaps" className="flex items-center gap-2">
                      <BriefcaseBusiness className="h-4 w-4" />
                      <span>Career Roadmaps</span>
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem asChild>
                    <Link href="/insights" className="flex items-center gap-2">
                      <MessageSquareCode className="h-4 w-4" />
                      <span>Industry Insights</span>
                    </Link>
                  </DropdownMenuItem>
                 
                  <DropdownMenuItem asChild>
                    <Link href="/github-analysis" className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      <span>GitHub Analysis</span>
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem asChild>
                    <Link href="/interview" className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      <span>Interview Prep</span>
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem asChild>
                    <Link href="/hackathons" className="flex items-center gap-2">
                      <StarsIcon className="h-4 w-4" />
                      <span>Hackathons</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SignedIn>

            {/* Auth Buttons */}
            <SignedOut>
              <SignInButton>
                <Button
                  variant="outline"
                  className="border-white/20 text-white hover:border-cyan-500 transition-colors"
                >
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton>
                <Button className="bg-[#6c47ff] text-white hover:bg-[#7d5bff] transition-all">
                  Sign Up
                </Button>
              </SignUpButton>
            </SignedOut>

            {/* User Avatar */}
            <SignedIn>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-9 h-9",
                    userButtonPopoverCard: "shadow-xl",
                  },
                }}
                afterSignOutUrl="/"
              />
            </SignedIn>
          </div>
        </div>
      </header>
    </>
  );
}
