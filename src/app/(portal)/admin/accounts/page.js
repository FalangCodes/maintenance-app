"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../../firebase"; 

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserPlus, Trash2, PauseCircle, PlayCircle, GraduationCap, ShieldAlert } from "lucide-react";

export default function AccountsPage() {
  const [students, setStudents] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [isAdding, setIsAdding] = useState(false);

  // Student Form State
  const [studentName, setStudentName] = useState("");
  const [studentSurname, setStudentSurname] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [uobkId, setUobkId] = useState("");

  // Admin Form State
  const [adminName, setAdminName] = useState("");
  const [adminSurname, setAdminSurname] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminRole, setAdminRole] = useState("Administrator");

  // Fetch all accounts
  useEffect(() => {
    const unsubscribeStudents = onSnapshot(collection(db, "Student_Users"), (snapshot) => {
      setStudents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    
    const unsubscribeAdmins = onSnapshot(collection(db, "Admin_Users"), (snapshot) => {
      setAdmins(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubscribeStudents();
      unsubscribeAdmins();
    };
  }, []);

  // Action: Add Student (Internal Onboarding)
  const handleAddStudent = async (e) => {
    e.preventDefault();
    setIsAdding(true);
    try {
      await addDoc(collection(db, "Student_Users"), {
        name: studentName,
        surname: studentSurname,
        email: studentEmail.toLowerCase(),
        roomNumber: roomNumber,
        uobkId: uobkId,
        status: "Active",
        accountType: "Student",
        dateAdded: serverTimestamp(),
      });
      // Reset form
      setStudentName(""); setStudentSurname(""); setStudentEmail(""); setRoomNumber(""); setUobkId("");
    } catch (error) {
      console.error("Error adding student:", error);
    } finally {
      setIsAdding(false);
    }
  };

  // Action: Add Admin
  const handleAddAdmin = async (e) => {
    e.preventDefault();
    if (!adminEmail.endsWith("@risestudentliving.com")) {
      alert("Admin emails must end with @risestudentliving.com");
      return;
    }
    setIsAdding(true);
    try {
      await addDoc(collection(db, "Admin_Users"), {
        name: adminName,
        surname: adminSurname,
        email: adminEmail.toLowerCase(),
        role: adminRole,
        status: "Active",
        accountType: "Admin",
        dateAdded: serverTimestamp(),
      });
      // Reset form
      setAdminName(""); setAdminSurname(""); setAdminEmail(""); setAdminRole("Administrator");
    } catch (error) {
      console.error("Error adding admin:", error);
    } finally {
      setIsAdding(false);
    }
  };

  // Action: Toggle Status
  const toggleAccess = async (id, currentStatus, collectionName) => {
    try {
      const newStatus = currentStatus === "Active" ? "Paused" : "Active";
      await updateDoc(doc(db, collectionName, id), { status: newStatus });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // Action: Remove Account
  const removeAccount = async (id, collectionName) => {
    if (window.confirm("Are you sure you want to permanently remove this account?")) {
      try {
        await deleteDoc(doc(db, collectionName, id));
      } catch (error) {
        console.error("Error removing account:", error);
      }
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Account Management</h1>
        <p className="text-slate-500 mt-1">Onboard students and provision administrator access based on the data model.</p>
      </div>

      <Tabs defaultValue="students" className="w-full">
        <TabsList className="mb-6 bg-slate-200/50 w-full justify-start rounded-lg h-auto p-1">
          <TabsTrigger value="students" className="data-[state=active]:bg-white py-2 px-6 flex items-center">
            <GraduationCap className="w-4 h-4 mr-2" />
            Residents ({students.length})
          </TabsTrigger>
          <TabsTrigger value="admins" className="data-[state=active]:bg-white py-2 px-6 flex items-center">
            <ShieldAlert className="w-4 h-4 mr-2" />
            Administrators ({admins.length})
          </TabsTrigger>
        </TabsList>

        {/* ================= STUDENT TAB ================= */}
        <TabsContent value="students" className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            
            {/* Student Onboarding Form */}
            <div className="xl:col-span-1">
              <Card className="border-slate-200 shadow-sm sticky top-24">
                <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                  <CardTitle className="text-lg flex items-center">
                    <UserPlus className="w-5 h-5 mr-2 text-slate-700" />
                    Internal Student Onboarding
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <form onSubmit={handleAddStudent} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>First Name</Label>
                        <Input value={studentName} onChange={(e) => setStudentName(e.target.value)} required />
                      </div>
                      <div className="space-y-2">
                        <Label>Surname</Label>
                        <Input value={studentSurname} onChange={(e) => setStudentSurname(e.target.value)} required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Student Email</Label>
                      <Input type="email" placeholder="student@spu.ac.za" value={studentEmail} onChange={(e) => setStudentEmail(e.target.value)} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Room Number</Label>
                        <Input placeholder="e.g., A104" value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} required />
                      </div>
                      <div className="space-y-2">
                        <Label>UOBK Number</Label>
                        <Input placeholder="Unique ID" value={uobkId} onChange={(e) => setUobkId(e.target.value)} required />
                      </div>
                    </div>
                    <Button type="submit" className="w-full bg-slate-900 text-white" disabled={isAdding}>
                      {isAdding ? "Saving..." : "Create Student Account"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Student Table */}
            <div className="xl:col-span-2">
              <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-0 bg-white overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-50/50">
                      <TableRow>
                        <TableHead>Student Name</TableHead>
                        <TableHead>UOBK / Email</TableHead>
                        <TableHead>Room</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium text-slate-900">{student.name} {student.surname}</TableCell>
                          <TableCell className="text-sm text-slate-500">
                            <span className="block font-medium text-slate-700">{student.uobkId}</span>
                            {student.email}
                          </TableCell>
                          <TableCell className="font-bold">{student.roomNumber}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={student.status === "Active" ? "text-green-600 bg-green-50" : "text-orange-600 bg-orange-50"}>
                              {student.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button variant="outline" size="sm" onClick={() => toggleAccess(student.id, student.status, "Student_Users")}>
                              {student.status === "Active" ? <PauseCircle className="w-4 h-4 text-orange-600" /> : <PlayCircle className="w-4 h-4 text-green-600" />}
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => removeAccount(student.id, "Student_Users")}>
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ================= ADMIN TAB ================= */}
        <TabsContent value="admins" className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            
            {/* Admin Onboarding Form */}
            <div className="xl:col-span-1">
              <Card className="border-slate-200 shadow-sm sticky top-24">
                <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                  <CardTitle className="text-lg flex items-center">
                    <ShieldAlert className="w-5 h-5 mr-2 text-slate-700" />
                    Provision Admin
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <form onSubmit={handleAddAdmin} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>First Name</Label>
                        <Input value={adminName} onChange={(e) => setAdminName(e.target.value)} required />
                      </div>
                      <div className="space-y-2">
                        <Label>Surname</Label>
                        <Input value={adminSurname} onChange={(e) => setAdminSurname(e.target.value)} required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Staff Email Address</Label>
                      <Input type="email" placeholder="@risestudentliving.com" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Assigned Role</Label>
                      <Select value={adminRole} onValueChange={setAdminRole}>
                        <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Administrator">Administrator</SelectItem>
                          <SelectItem value="Maintenance Staff">Maintenance Staff</SelectItem>
                          <SelectItem value="Residence Management">Residence Management</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" className="w-full bg-slate-900 text-white" disabled={isAdding}>
                      {isAdding ? "Provisioning..." : "Add Administrator"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Admin Table */}
            <div className="xl:col-span-2">
              <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-0 bg-white overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-50/50">
                      <TableRow>
                        <TableHead>Admin Name</TableHead>
                        <TableHead>Email Address</TableHead>
                        <TableHead>System Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {admins.map((admin) => (
                        <TableRow key={admin.id}>
                          <TableCell className="font-medium text-slate-900">{admin.name} {admin.surname}</TableCell>
                          <TableCell className="text-sm text-slate-500">{admin.email}</TableCell>
                          <TableCell><Badge variant="secondary">{admin.role}</Badge></TableCell>
                          <TableCell>
                            <Badge variant="outline" className={admin.status === "Active" ? "text-green-600 bg-green-50" : "text-orange-600 bg-orange-50"}>
                              {admin.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button variant="outline" size="sm" onClick={() => toggleAccess(admin.id, admin.status, "Admin_Users")}>
                              {admin.status === "Active" ? <PauseCircle className="w-4 h-4 text-orange-600" /> : <PlayCircle className="w-4 h-4 text-green-600" />}
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => removeAccount(admin.id, "Admin_Users")}>
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}