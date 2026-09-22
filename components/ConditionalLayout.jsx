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