"use client";

import React, { useEffect, useState } from "react";
import styles from "./admin.module.css";

const AdminPage = () => {
  const [assistants, setAssistants] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [instructions, setInstructions] = useState("");
  const [functionName, setFunctionName] = useState("");
  const [functionDescription, setFunctionDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchAssistants = async () => {
    setLoading(true);
    const resp = await fetch("/api/assistants", { method: "GET" });
    const data = await resp.json();
    setAssistants(data);
    setLoading(false);
  };

  const createAssistant = async () => {
    await fetch("/api/assistants", { method: "POST" });
    setMessage("Assistant created");
    fetchAssistants();
  };

  useEffect(() => {
    fetchAssistants();
  }, []);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(""), 2000);
    return () => clearTimeout(t);
  }, [message]);

  const selectAssistant = async (id: string) => {
    setLoading(true);
    const resp = await fetch(`/api/assistants/${id}`, { method: "GET" });
    const data = await resp.json();
    setSelected(data);
    setInstructions(data.instructions || "");
    setLoading(false);
  };

  const updateInstructions = async () => {
    if (!selected) return;
    await fetch(`/api/assistants/${selected.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ instructions }),
    });
    await selectAssistant(selected.id);
    fetchAssistants();
    setMessage("Instructions updated");
  };

  const deleteAssistant = async () => {
    if (!selected) return;
    if (!confirm("Delete this assistant?")) return;
    await fetch(`/api/assistants/${selected.id}`, { method: "DELETE" });
    setSelected(null);
    fetchAssistants();
    setMessage("Assistant deleted");
  };

  const addFunction = async () => {
    if (!selected) return;
    const tools = [
      ...(selected.tools || []),
      {
        type: "function",
        function: {
          name: functionName,
          description: functionDescription,
          parameters: { type: "object", properties: {} },
        },
      },
    ];
    await fetch(`/api/assistants/${selected.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tools }),
    });
    setFunctionName("");
    setFunctionDescription("");
    await selectAssistant(selected.id);
    setMessage("Function added");
  };

  const removeFunction = async (name: string) => {
    if (!selected) return;
    const tools = (selected.tools || []).filter(
      (t: any) => t.type !== "function" || t.function.name !== name
    );
    await fetch(`/api/assistants/${selected.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tools }),
    });
    await selectAssistant(selected.id);
    setMessage("Function removed");
  };

  return (
    <div className={styles.container}>
      <h1>Assistants Admin</h1>
      <div className={styles.actions}>
        <button className={styles.button} onClick={createAssistant}>New Assistant</button>
        <button className={styles.button} onClick={fetchAssistants}>Refresh</button>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <ul className={styles.list}>
          {assistants.map((a) => (
            <li key={a.id} className={styles.listItem}>
              {a.name || a.id}
              <button className={styles.button} onClick={() => selectAssistant(a.id)}>
                Select
              </button>
            </li>
          ))}
        </ul>
      )}

      {selected && (
        <div className={styles.details}>
          <h2>{selected.name}</h2>
          <div>
            <label>Instructions:</label>
            <br />
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={4}
              cols={60}
            />
            <br />
            <button className={styles.button} onClick={updateInstructions}>Update Instructions</button>
            <button className={styles.button} style={{ marginLeft: "10px" }} onClick={deleteAssistant}>Delete Assistant</button>
          </div>
          <div style={{ marginTop: "20px" }}>
            <h3>Functions</h3>
            <ul>
              {(selected.tools || [])
                .filter((t: any) => t.type === "function")
                .map((t: any) => (
                  <li key={t.function.name} className={styles.listItem}>
                    {t.function.name}
                    <button className={styles.button} onClick={() => removeFunction(t.function.name)}>
                      Remove
                    </button>
                  </li>
                ))}
            </ul>
            <div className={styles.functionInputs}>
              <input
                placeholder="Function name"
                value={functionName}
                onChange={(e) => setFunctionName(e.target.value)}
              />
              <input
                placeholder="Description"
                value={functionDescription}
                onChange={(e) => setFunctionDescription(e.target.value)}
              />
              <button className={styles.button} onClick={addFunction}>Add Function</button>
            </div>
          </div>
        </div>
      )}
      {message && <div className={styles.message}>{message}</div>}
    </div>
  );
};

export default AdminPage;
