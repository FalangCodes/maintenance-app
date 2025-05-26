"use client";
import styles from "../styles/NavBar.module.css";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase"; // ✅ correct import

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/");
  };

  return (
    <>
      <nav className={styles.navbar}>
        <Link href="/" className={styles.title}>
          <h3>Off-campus Maintenance Reports</h3>
        </Link>

        {pathname === "/" && !isAuthenticated && (
          <Link href="/login">
            <button className={styles.loginButton}>Admin Login</button>
          </Link>
        )}

        {pathname === "/dashboard" && isAuthenticated && (
          <button onClick={handleSignOut} className={styles.logoutButton}>
            Sign Out
          </button>
        )}
      </nav>

      <div className={styles.spacer}></div>
    </>
  );
}
