"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

import { Button } from "@/components/ui/button";

export default function NavBar() {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });

    return () => unsubscribe();
  }, []);

  // Strict Visibility Rule: 
  // ONLY show the login button if the user is on the absolute root landing page ("/") 
  // AND they are not currently logged in.
  const showLoginButton = !isAuthenticated && pathname === "/";

  // Prevent hydration mismatch on initial load
  if (!isClient) return <header className="h-16 w-full bg-slate-900 border-b border-slate-800 shrink-0"></header>;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-900 text-white shadow-md shrink-0">
      <nav className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 sm:px-6">
        
        {/* Brand / Logo Area */}
        <Link href="/" className="flex items-center transition-opacity hover:opacity-80">
          <h3 className="text-xl font-bold tracking-tight text-white">
            Off-campus Maintenance Reports
          </h3>
        </Link>

        {/* Navigation Actions */}
        <div className="flex items-center space-x-4">
          
          {showLoginButton && (
            <Link href="/login">
              <Button className="bg-white text-slate-900 hover:bg-slate-200 font-semibold shadow-sm">
                Login
              </Button>
            </Link>
          )}
          
        </div>
      </nav>
    </header>
  );
}