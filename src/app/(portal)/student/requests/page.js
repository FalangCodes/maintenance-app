"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../../../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ClipboardList } from "lucide-react";

export default function StudentRequestsPage() {
  const [user, setUser] = useState(null);
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.push("/login");
      }
    });
    return () => unsubscribeAuth();
  }, [router]);

  useEffect(() => {
    if (!user) return;

    // Secure Query: Only fetch logs where the studentEmail matches the logged-in user
    // and sort them so the newest logs appear at the top
    const logsRef = collection(db, "Maintenance_Logs");
    const q = query(
      logsRef, 
      where("studentEmail", "==", user.email),
      orderBy("dateReported", "desc")
    );

    const unsubscribeLogs = onSnapshot(q, (snapshot) => {
      const fetchedLogs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setLogs(fetchedLogs);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching logs:", error);
      setIsLoading(false);
      // Note: If you get a Firebase error here initially, it means you need to create an index.
      // Firebase will provide a clickable link in the browser console to auto-create it.
    });

    return () => unsubscribeLogs();
  }, [user]);

  // Formatting Helpers
  const formatDate = (timestamp) => {
    if (!timestamp?.seconds) return "N/A";
    return new Date(timestamp.seconds * 1000).toLocaleString('en-ZA', { 
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
    });
  };

  const getStatusBadge = (status) => {
    if (status === "Resolved" || status === "Complete") {
      return <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Resolved</Badge>;
    }
    return <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">{status || "Pending"}</Badge>;
  };

  if (!user || isLoading) {
    return <div className="flex min-h-screen items-center justify-center"><p className="animate-pulse text-slate-500">Loading your history...</p></div>;
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">My Requests</h1>
        <p className="text-slate-500 mt-1">Track the status and resolution history of your submitted maintenance logs.</p>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="bg-white border-b border-slate-100 pb-4">
          <CardTitle className="text-xl flex items-center justify-between">
            <span className="flex items-center">
              <ClipboardList className="w-5 h-5 mr-2 text-slate-700" />
              Maintenance History
            </span>
            <Badge variant="secondary" className="font-normal">
              {logs.length} Total Records
            </Badge>
          </CardTitle>
          <CardDescription>
            Logs cannot be edited after submission. If an issue persists after being marked resolved, please submit a new log.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 bg-white overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="w-[150px]">Date Reported</TableHead>
                <TableHead className="w-[100px]">Room</TableHead>
                <TableHead className="w-[150px]">Category</TableHead>
                <TableHead className="max-w-[250px]">Description</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead className="w-[200px]">Resolution History</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                    You have not submitted any maintenance requests yet.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-slate-50/50">
                    <TableCell className="text-sm font-medium text-slate-700">
                      {formatDate(log.dateReported)}
                    </TableCell>
                    <TableCell className="font-bold text-slate-900">
                      {log.roomNumber}
                    </TableCell>
                    <TableCell>
                      <span className="block font-medium">{log.issueType || log.category}</span>
                    </TableCell>
                    <TableCell className="truncate max-w-[250px]" title={log.description}>
                      {log.description}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(log.status)}
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {log.status === "Resolved" && log.lastUpdated ? (
                        <>
                          <span className="block text-green-700 font-medium">Resolved by Admin</span>
                          <span className="block">{formatDate(log.lastUpdated)}</span>
                        </>
                      ) : (
                        <span className="text-slate-400 italic">Awaiting action</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}