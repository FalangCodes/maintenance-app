"use client";
import NavBar from "@/components/NavBar";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import styles from "../../styles/Login.module.css";



export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const [loading, setLoading] = useState(false);


  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
  
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (error) {
      setError("Invalid email or password");
      console.error("Login error:", error);
      setLoading(false);
    }
  };
  

  return (
    <div className={styles.container}>
      <NavBar />
      <h2 className={styles.header}>Admin Login</h2>
      {loading && <p className={styles.loadingMessage}>Loading...</p>}
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          className={styles.inputField}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className={styles.inputField}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className={styles.loginButton}>Login</button>
        {error && <p className={styles.errorMessage}>{error}</p>}
      </form>
    </div>
  );
}
