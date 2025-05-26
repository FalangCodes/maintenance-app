"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, onSnapshot, updateDoc, doc } from "firebase/firestore";
import styles from "../../styles/Dashboard.module.css";
import NavBar from "@/components/NavBar";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [logsByType, setLogsByType] = useState({});
  const router = useRouter();

  const ISSUE_TYPES = ["WI-FI", "Laundry", "Plumbing", "Electrical", "Cleaning Services", "Construction"];

  const [totalLogs, setTotalLogs] = useState(0);
  const [resolvedLogs, setResolvedLogs] = useState(0);
  const [pendingLogs, setPendingLogs] = useState(0);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribeAuth();
  }, [router]);

  useEffect(() => {
    const unsubscribeLogs = onSnapshot(collection(db, "Maintenance_Logs"), (snapshot) => {
      const logs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      const grouped = logs.reduce((acc, log) => {
        const type = log.issueType || "Other";
        if (!acc[type]) acc[type] = [];
        acc[type].push(log);
        return acc;
      }, {});

      setLogsByType(grouped);

      // Count total logs and the status breakdown
      let resolvedCount = 0;
      let pendingCount = 0;

      logs.forEach((log) => {
        if (log.status === "Complete") {
          resolvedCount++;
        } else if (log.status === "In Progress") {
          pendingCount++;
        }
      });

      setTotalLogs(logs.length);
      setResolvedLogs(resolvedCount);
      setPendingLogs(pendingCount);
    });

    return () => unsubscribeLogs();
  }, []);

  const markAsComplete = async (logId) => {
    try {
      const logRef = doc(db, "Maintenance_Logs", logId);
      await updateDoc(logRef, { status: "Complete" });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  

  return (
    <div className={styles.container}>
      <NavBar />
      {user ? (
        <>
          <h2>Welcome, {user.email}</h2>
          <p>
            Total Logs: {totalLogs} | {resolvedLogs} Resolved, {pendingLogs} Pending
          </p>

          {ISSUE_TYPES.map((type) => (
            logsByType[type]?.length > 0 && (
              <div key={type}>
                <h3>{type} Requests</h3>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Room Number</th>
                      <th>Description</th>
                      <th>Date Reported</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logsByType[type].map((log) => (
                      <tr key={log.id}>
                        <td>{log.roomNumber}</td>
                        <td>{log.description}</td>
                        <td>{new Date(log.dateReported?.seconds * 1000).toLocaleString()}</td>
                        <td>{log.status}</td>
                        <td>
                          {log.status !== "Complete" && (
                            <button
                              className={styles.doneButton}
                              onClick={() => markAsComplete(log.id)}
                            >
                              Done
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ))}
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
