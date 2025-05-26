"use client";

import styles from "../styles/Footer.module.css"; 
const Footer = () => {
  return (
    <footer className={styles.footer}>
      <p className={styles.text}>
        <strong>DISCLAIMER:</strong> This system is in no way affiliated with any residence from which the data in this system is collected.
        The purpose of this system is to collect data about maintenance issues of off-campus students in their residence.
      </p>
    </footer>
  );
};

export default Footer;