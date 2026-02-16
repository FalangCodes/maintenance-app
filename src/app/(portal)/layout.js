"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { auth } from "../../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import NavBar from "@/components/NavBar";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { 
  LayoutDashboard, 
  Users, 
  LogOut, 
  Menu, 
  ChevronLeft, 
  ChevronRight,
  PenTool,
  ClipboardList
} from "lucide-react";

export default function PortalLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) setUser(currentUser);
      else router.push("/login");
    });
    return () => unsubscribe();
  }, [router]);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/login");
  };

  if (!user) return null; // Wait for Firebase auth to resolve

  // --- Dynamic RBAC Routing Logic ---
  const isAdminArea = pathname.startsWith("/admin");
  const portalTitle = isAdminArea ? "Admin Portal" : "Student Portal";

  const adminLinks = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Accounts", href: "/admin/accounts", icon: Users },
  ];

  const studentLinks = [
    { name: "Log an Issue", href: "/student", icon: PenTool },
    { name: "My Requests", href: "/student/requests", icon: ClipboardList },
  ];

  const navItems = isAdminArea ? adminLinks : studentLinks;

  // --- Shared Navigation Component ---
  const NavLinks = ({ isMobile = false }) => (
    <div className="flex flex-col space-y-2 flex-1">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link key={item.name} href={item.href}>
            <div className={`flex items-center space-x-3 rounded-lg px-3 py-2.5 transition-colors ${
              isActive 
                ? "bg-slate-800 text-white font-medium shadow-sm" 
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            } ${isCollapsed && !isMobile ? "justify-center" : "justify-start"}`}>
              <item.icon className="h-5 w-5 shrink-0" />
              {(!isCollapsed || isMobile) && <span>{item.name}</span>}
            </div>
          </Link>
        );
      })}
    </div>
  );

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50">
      
      {/* 1. The Global Top Navbar (Fixed at top) */}
      <div className="shrink-0 z-50">
        <NavBar />
      </div>
      
      {/* 2. The Main Wrapper (Takes remaining height) */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* --- DESKTOP SIDEBAR (Fixed height, doesn't scroll with page) --- */}
        <aside className={`hidden md:flex flex-col bg-slate-900 text-white border-r border-slate-800 transition-all duration-300 shrink-0 ${
          isCollapsed ? "w-20" : "w-64"
        }`}>
          <div className="flex h-16 items-center justify-between px-4 border-b border-slate-800 shrink-0">
            {!isCollapsed && <span className="font-bold text-lg tracking-tight">{portalTitle}</span>}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-slate-400 hover:text-white hover:bg-slate-800 ml-auto"
            >
              {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </Button>
          </div>
          
          {/* Sidebar Links (Internally scrollable if you add many links later) */}
          <div className="flex-1 p-4 flex flex-col overflow-y-auto">
            <NavLinks />
          </div>

          <div className="p-4 border-t border-slate-800 shrink-0">
            <Button 
              variant="ghost" 
              onClick={handleSignOut}
              className={`w-full text-slate-400 hover:text-white hover:bg-slate-800 hover:text-red-400 ${
                isCollapsed ? "justify-center px-0" : "justify-start px-3"
              }`}
            >
              <LogOut className="h-5 w-5" />
              {!isCollapsed && <span className="ml-3">Sign Out</span>}
            </Button>
          </div>
        </aside>

        {/* --- MAIN CONTENT AREA --- */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          
          {/* MOBILE TOP NAVIGATION */}
          <header className="md:hidden flex items-center justify-between h-16 bg-slate-900 px-4 border-b border-slate-800 shrink-0">
            <span className="font-bold text-white text-lg">{portalTitle}</span>
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-slate-800">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 bg-slate-900 border-r-slate-800 p-0 text-white flex flex-col">
                <SheetTitle className="sr-only">Mobile Navigation Menu</SheetTitle>
                <div className="h-16 flex items-center px-6 border-b border-slate-800">
                  <span className="font-bold text-lg">Menu</span>
                </div>
                <div className="flex-1 p-4">
                  <NavLinks isMobile={true} />
                </div>
                <div className="p-4 border-t border-slate-800">
                  <Button 
                    variant="ghost" 
                    onClick={handleSignOut}
                    className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800 hover:text-red-400"
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    Sign Out
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </header>

          {/* PAGE CONTENT GOES HERE (Only this specific area is allowed to scroll!) */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>

        </div>
      </div>
    </div>
  );
}