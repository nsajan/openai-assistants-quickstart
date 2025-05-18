"use client";

import React from "react";
import styles from "./page.module.css";

const Home = () => {
  const categories = {
    "Basic chat": "basic-chat",
    "Function calling": "function-calling",
    "File search": "file-search",
    All: "all",
    Admin: "/admin",
  };

  return (
    <main className={styles.main}>
      <div className={styles.title}>
        Explore sample apps built with Assistants API
      </div>
      <div className={styles.container}>
        {Object.entries(categories).map(([name, url]) => {
          const href = url.startsWith("/") ? url : `/examples/${url}`;
          return (
            <a key={name} className={styles.category} href={href}>
              {name}
            </a>
          );
        })}
      </div>
    </main>
  );
};

export default Home;
