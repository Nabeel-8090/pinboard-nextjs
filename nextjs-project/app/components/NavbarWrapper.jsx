"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

const AUTH_PATHS = ["/signin", "/signup", "/register"];

export default function NavbarWrapper() {
  const pathname = usePathname();
  const hideNavbar = AUTH_PATHS.includes(pathname);
  if (hideNavbar) return null;
  return <Navbar />;
}
