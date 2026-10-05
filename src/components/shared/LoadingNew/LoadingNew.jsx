import React from "react";
import styles from "./styles.module.css";

export const LoadingNew = () => {
  return (
    <div className={styles.container} >
      <div className={styles.dnaLoader}>
        {[...Array(12)].map((_, i) => (
          <div key={i} className={styles.strand} />
        ))}
        <div className={styles.ring} />
      </div>
    </div>
    
  );
};

export default LoadingNew;
