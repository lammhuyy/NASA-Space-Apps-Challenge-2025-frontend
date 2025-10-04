"use client";

import { useParams } from "next/navigation";

export default function VisualizationPage() {
  const { id } = useParams(); // ✅ get route param

  return (
    <div style={{ color: "white", padding: "40px", textAlign: "center" }}>
      <h1>🔭 Visualization Page</h1>
      <p>You are viewing visualization for ID: <b>{id}</b></p>
    </div>
  );
}
