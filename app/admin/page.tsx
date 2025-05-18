"use client";

import React, { useEffect, useState } from "react";

const AdminPage = () => {
  const [assistants, setAssistants] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [instructions, setInstructions] = useState("");
  const [functionName, setFunctionName] = useState("");
  const [functionDescription, setFunctionDescription] = useState("");

  const fetchAssistants = async () => {
    const resp = await fetch("/api/assistants", { method: "GET" });
    const data = await resp.json();
    setAssistants(data);
  };

  useEffect(() => {
    fetchAssistants();
  }, []);

  const selectAssistant = async (id: string) => {
    const resp = await fetch(`/api/assistants/${id}`, { method: "GET" });
    const data = await resp.json();
    setSelected(data);
    setInstructions(data.instructions || "");
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
  };

  const deleteAssistant = async () => {
    if (!selected) return;
    await fetch(`/api/assistants/${selected.id}`, { method: "DELETE" });
    setSelected(null);
    fetchAssistants();
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
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Assistants Admin</h1>
      <button onClick={fetchAssistants}>Refresh</button>
      <ul>
        {assistants.map((a) => (
          <li key={a.id} style={{ marginTop: "10px" }}>
            {a.name || a.id}
            <button style={{ marginLeft: "10px" }} onClick={() => selectAssistant(a.id)}>
              Select
            </button>
          </li>
        ))}
      </ul>

      {selected && (
        <div style={{ marginTop: "20px" }}>
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
            <button onClick={updateInstructions}>Update Instructions</button>
            <button style={{ marginLeft: "10px" }} onClick={deleteAssistant}>Delete Assistant</button>
          </div>
          <div style={{ marginTop: "20px" }}>
            <h3>Functions</h3>
            <ul>
              {(selected.tools || [])
                .filter((t: any) => t.type === "function")
                .map((t: any) => (
                  <li key={t.function.name}>
                    {t.function.name}
                    <button style={{ marginLeft: "10px" }} onClick={() => removeFunction(t.function.name)}>
                      Remove
                    </button>
                  </li>
                ))}
            </ul>
            <div>
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
              <button onClick={addFunction}>Add Function</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
