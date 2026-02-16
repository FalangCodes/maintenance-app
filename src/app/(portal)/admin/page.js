"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, onSnapshot, updateDoc, doc, getDocs, serverTimestamp } from "firebase/firestore";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import NavBar from "@/components/NavBar";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [logs, setLogs] = useState([]);
  const router = useRouter();

  // Proposal specifies these exact urgency groups in this order
  const URGENCY_GROUPS = ["Fire", "Flood", "Critical infrastructure", "Standard"];

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) setUser(currentUser);
      else router.push("/login");
    });
    return () => unsubscribeAuth();
  }, [router]);

  useEffect(() => {
    const unsubscribeLogs = onSnapshot(collection(db, "Maintenance_Logs"), (snapshot) => {
      const fetchedLogs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setLogs(fetchedLogs);
    });
    return () => unsubscribeLogs();
  }, []);

  // Action: Mark as Resolved & capture Audit Fields
  const markAsResolved = async (logId) => {
    try {
      const logRef = doc(db, "Maintenance_Logs", logId);
      await updateDoc(logRef, { 
        status: "Resolved",
        updatedBy: user.email,          // Audit Field: Admin Name
        lastUpdated: serverTimestamp()  // Audit Field: Timestamp
      });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const exportToExcel = async () => {
    try {
      const snapshot = await getDocs(collection(db, "Maintenance_Logs"));
      const exportData = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          Room: data.roomNumber || "N/A",
          Category: data.issueType || "N/A",
          Urgency: data.urgency || "Standard",
          Description: data.description || "N/A",
          DateReported: data.dateReported?.seconds ? new Date(data.dateReported.seconds * 1000).toLocaleString() : "N/A",
          Status: data.status || "Unresolved",
          UpdatedBy: data.updatedBy || "N/A",
          LastUpdated: data.lastUpdated?.seconds ? new Date(data.lastUpdated.seconds * 1000).toLocaleString() : "N/A",
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      worksheet["!cols"] = [{ wch: 10 }, { wch: 20 }, { wch: 15 }, { wch: 40 }, { wch: 20 }, { wch: 15 }, { wch: 25 }, { wch: 20 }];
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Maintenance Logs");
      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      saveAs(blob, "maintenance_logs.xlsx");
    } catch (error) {
      console.error("Error exporting Excel:", error);
    }
  };

  // Helper for Status Badge Styling
  const getStatusBadge = (status) => {
    if (status === "Resolved" || status === "Complete") {
      return <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Resolved</Badge>;
    }
    return <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">{status || "Unresolved"}</Badge>;
  };

  // Helper for formatting Firestore Timestamps
  const formatDate = (timestamp) => {
    if (!timestamp?.seconds) return "N/A";
    return new Date(timestamp.seconds * 1000).toLocaleString('en-ZA', { 
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
    });
  };

  // --- Data Processing based on Proposal Rules ---
  
  // 1. Separate into Resolved and Unresolved
  const resolvedLogs = logs.filter(log => log.status === "Resolved" || log.status === "Complete")
                           .sort((a, b) => (b.dateReported?.seconds || 0) - (a.dateReported?.seconds || 0)); // Latest first
  
  const unresolvedLogs = logs.filter(log => log.status !== "Resolved" && log.status !== "Complete");

  // 2. Group Unresolved logs by Urgency
  const groupedUnresolved = URGENCY_GROUPS.reduce((acc, level) => {
    acc[level] = unresolvedLogs
      .filter(log => (log.urgency || "Standard") === level)
      .sort((a, b) => (b.dateReported?.seconds || 0) - (a.dateReported?.seconds || 0)); // Latest first
    return acc;
  }, {});

  if (!user) return <div className="flex min-h-screen items-center justify-center"><p className="animate-pulse">Loading...</p></div>;

  // Reusable Table Component to ensure visual consistency
  const LogTable = ({ tableLogs, showAction }) => (
    <Table>
      <TableHeader className="bg-slate-50/50">
        <TableRow>
          <TableHead className="w-[80px]">Room</TableHead>
          <TableHead className="w-[150px]">Category</TableHead>
          <TableHead className="max-w-[250px]">Description</TableHead>
          <TableHead className="w-[150px]">Date Reported</TableHead>
          <TableHead className="w-[100px]">Status</TableHead>
          <TableHead className="w-[200px]">Audit Trail</TableHead>
          {showAction && <TableHead className="w-[100px] text-right">Action</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {tableLogs.map((log) => (
          <TableRow key={log.id} className="hover:bg-slate-50/50">
            <TableCell className="font-bold">{log.roomNumber}</TableCell>
            <TableCell>
              <span className="block font-medium">{log.issueType || log.category}</span>
              {log.urgency && log.urgency !== "Standard" && (
                <Badge variant="destructive" className="mt-1 text-[10px]">{log.urgency}</Badge>
              )}
            </TableCell>
            <TableCell className="truncate max-w-[250px]" title={log.description}>{log.description}</TableCell>
            <TableCell className="text-sm text-slate-500">{formatDate(log.dateReported)}</TableCell>
            <TableCell>{getStatusBadge(log.status)}</TableCell>
            <TableCell className="text-xs text-slate-500">
              {log.updatedBy ? (
                <>
                  <span className="block font-medium text-slate-700">{log.updatedBy}</span>
                  <span className="block">{formatDate(log.lastUpdated)}</span>
                </>
              ) : "Unassigned"}
            </TableCell>
            {showAction && (
              <TableCell className="text-right">
                <Button size="sm" onClick={() => markAsResolved(log.id)} className="bg-slate-900 text-white">
                  Resolve
                </Button>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      
      <main className="mx-auto max-w-[1400px] px-4 pt-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Maintenance Control Panel</h1>
            <p className="text-slate-500 mt-1">Logged in as {user.email}</p>
          </div>
          <Button onClick={exportToExcel} variant="outline" className="bg-white">
            Export Audit Report
          </Button>
        </div>

        {/* Resolved / Unresolved Toggle */}
        <Tabs defaultValue="unresolved" className="w-full">
          <TabsList className="mb-6 bg-slate-200/50">
            <TabsTrigger value="unresolved" className="data-[state=active]:bg-white">Unresolved ({unresolvedLogs.length})</TabsTrigger>
            <TabsTrigger value="resolved" className="data-[state=active]:bg-white">Resolved ({resolvedLogs.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="unresolved" className="space-y-8">
            {URGENCY_GROUPS.map((urgencyLevel) => {
              const logsForUrgency = groupedUnresolved[urgencyLevel];
              
              // Rule: Empty sections are hidden
              if (logsForUrgency.length === 0) return null;

              // Visual styling based on urgency
              const isCritical = urgencyLevel === "Fire" || urgencyLevel === "Flood";

              return (
                <Card key={urgencyLevel} className={`shadow-sm ${isCritical ? 'border-red-200' : 'border-slate-200'}`}>
                  <CardHeader className={`${isCritical ? 'bg-red-50/50' : 'bg-white'} border-b pb-4`}>
                    <CardTitle className={`text-lg flex items-center justify-between ${isCritical ? 'text-red-700' : 'text-slate-800'}`}>
                      {urgencyLevel} Incidents
                      <Badge variant={isCritical ? "destructive" : "secondary"}>
                        {logsForUrgency.length} Active
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 bg-white overflow-x-auto">
                    <LogTable tableLogs={logsForUrgency} showAction={true} />
                  </CardContent>
                </Card>
              );
            })}
            
            {unresolvedLogs.length === 0 && (
              <div className="text-center py-12 text-slate-500 bg-white rounded-lg border border-slate-200 border-dashed">
                No unresolved maintenance logs. Everything is up to date!
              </div>
            )}
          </TabsContent>

          <TabsContent value="resolved">
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="bg-white border-b pb-4">
                <CardTitle className="text-lg text-slate-800">Resolved History</CardTitle>
              </CardHeader>
              <CardContent className="p-0 bg-white overflow-x-auto">
                <LogTable tableLogs={resolvedLogs} showAction={false} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}