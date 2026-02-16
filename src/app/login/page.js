"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase"; // Adjust this path if your firebase.js is located elsewhere
import NavBar from "@/components/NavBar";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // 1. Authenticate with Firebase
      await signInWithEmailAndPassword(auth, email, password);
      
      // 2. Format the email to lowercase just to be safe
      const userEmail = email.toLowerCase();

      // 3. RBAC Domain Routing
      if (userEmail.endsWith("@risestudentliving.com")) {
        // It's an admin/staff member
        router.push("/admin");
      } else if (userEmail.endsWith("@student.spu.ac.za")) {
        // It's a resident
        router.push("/student");
      } else {
        // Fallback for any other valid user type, or force them to the student portal
        router.push("/student");
      }

    } catch (err) {
      setError("Failed to sign in. Please check your credentials.");
      console.error("Auth Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <NavBar/>
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold tracking-tight">
              Residence Portal
            </CardTitle>
            <CardDescription>
              Enter your student email and password to log in
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Student Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="student@domain.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              {error && (
                <p className="text-sm font-medium text-red-500">{error}</p>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}