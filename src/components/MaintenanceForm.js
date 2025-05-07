"use client";

import { useState } from "react";
import styles from "../styles/MaintenanceForm.module.css"; 
import { db } from "../firebase";
import { doc, setDoc, Timestamp } from "firebase/firestore";

export default function MaintenanceForm() {
  const [roomNumber, setRoomNumber] = useState("");
  const [description, setDescription] = useState("");
  const [issueType, setIssueType] = useState("WI-FI");

  const submitRequest = async () => {
    if (!roomNumber || !description) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      await setDoc(doc(db, "Maintenance_Logs", roomNumber), {
        dateReported: Timestamp.now(),
        description,
        issueType,
        roomNumber,
        status: "In Progress", // Default status
      });

      setRoomNumber("");
      setDescription("");
      setIssueType("WI-FI");
      alert("Maintenance request submitted successfully!");
    } catch (error) {
      console.error("Error submitting request:", error);
      alert("Failed to submit request. Try again later.");
    }
  };

  return (
    <div className={styles.formContainer}>
      <h2>Submit a Maintenance Request</h2>
      <input
        type="text"
        placeholder="Room Number"
        className={styles.inputField}
        value={roomNumber}
        onChange={(e) => setRoomNumber(e.target.value)}
      />
      <textarea
        placeholder="Issue Description"
        className={styles.textareaField}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <select
        className={styles.selectField}
        value={issueType}
        onChange={(e) => setIssueType(e.target.value)}
      >
        <option value="WI-FI">WI-FI</option>
        <option value="Laundry">Laundry</option>
        <option value="Plumbing">Plumbing</option>
        <option value="Electrical">Electrical</option>
        <option value="Cleaning Services">Cleaning</option>
      </select>
      <button className={styles.submitButton} onClick={submitRequest}>
        Submit
      </button>
    </div>
  );
}
