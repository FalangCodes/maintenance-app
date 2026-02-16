"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export default function StudentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Form State
  const [roomNumber, setRoomNumber] = useState("");
  const [category, setCategory] = useState("");
  const [urgency, setUrgency] = useState("Standard"); // Default to standard
  const [description, setDescription] = useState("");

  const CATEGORIES = ["WI-FI", "Laundry", "Plumbing", "Electrical", "Cleaning Services", "Furniture", "Other"];
  
  // These map exactly to the Admin Dashboard tabs we built
  const URGENCY_LEVELS = ["Standard", "Critical infrastructure", "Flood", "Fire"];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) setUser(currentUser);
      else router.push("/login");
    });
    return () => unsubscribe();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Proposal Requirement: Automatic attachment of verified student details
      await addDoc(collection(db, "Maintenance_Logs"), {
        studentEmail: user.email, 
        roomNumber: roomNumber,
        issueType: category,
        urgency: urgency,
        description: description,
        status: "Unresolved", // Initial state for the admin tables
        dateReported: serverTimestamp(),
        // Admin Audit fields are left null upon creation
        updatedBy: null,
        lastUpdated: null,
      });

      setSubmitSuccess(true);
      
      // Reset form fields
      setRoomNumber("");
      setCategory("");
      setUrgency("Standard");
      setDescription("");

      // Clear success message after 4 seconds
      setTimeout(() => setSubmitSuccess(false), 4000);

    } catch (error) {
      console.error("Error submitting maintenance log:", error);
      alert("Failed to submit request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return <div className="flex min-h-screen items-center justify-center"><p className="animate-pulse">Loading...</p></div>;

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Log an Issue</h1>
        <p className="text-slate-500 mt-1">Submit a new maintenance request for your residence.</p>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="bg-slate-50 border-b border-slate-100">
          <CardTitle className="text-xl">Maintenance Request Form</CardTitle>
          <CardDescription>
            Please provide accurate details to help our team resolve the issue quickly.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          
          {submitSuccess && (
            <div className="mb-6 flex items-center gap-3 rounded-lg bg-green-50 p-4 text-green-700 border border-green-200">
              <CheckCircle2 className="h-5 w-5" />
              <p className="font-medium">Success! Your maintenance request has been logged.</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Verified User Display (Read-Only) */}
            <div className="space-y-2">
              <Label className="text-slate-500">Student Email (Verified)</Label>
              <Input 
                value={user.email} 
                disabled 
                className="bg-slate-50 text-slate-500 border-slate-200 cursor-not-allowed" 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="room">Room Number <span className="text-red-500">*</span></Label>
                <Input
                  id="room"
                  placeholder="e.g., A104"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  required
                />
              </div>

              {/* Proposal Requirement: Structured Dropdown System */}
              <div className="space-y-2">
                <Label>Category <span className="text-red-500">*</span></Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select issue type" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Urgency Level <span className="text-red-500">*</span></Label>
              <Select value={urgency} onValueChange={setUrgency}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select urgency" />
                </SelectTrigger>
                <SelectContent>
                  {URGENCY_LEVELS.map((level) => (
                    <SelectItem 
                      key={level} 
                      value={level}
                      className={level === "Fire" || level === "Flood" ? "text-red-600 font-medium" : ""}
                    >
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500 flex items-center mt-1">
                <AlertCircle className="h-3 w-3 mr-1" />
                Only select Fire, Flood, or Critical for active emergencies.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
              <Textarea
                id="description"
                placeholder="Please describe the issue in detail..."
                className="min-h-[120px] bg-white resize-y"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full md:w-auto bg-slate-900 text-white hover:bg-slate-800"
              disabled={isSubmitting || !category}
            >
              {isSubmitting ? "Submitting..." : "Submit Maintenance Log"}
            </Button>
            
          </form>
        </CardContent>
      </Card>
    </div>
  );
}