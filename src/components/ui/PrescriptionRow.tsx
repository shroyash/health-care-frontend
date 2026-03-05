"use client";
import { Icons } from "./Icons";

interface PrescriptionRowProps {
  medicine: string;
  dosage: string;
  frequency: string;
  onDelete: () => void;
}

export function PrescriptionRow({ medicine, dosage, frequency, onDelete }: PrescriptionRowProps) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "1fr 80px 100px 32px",
      gap: "8px",
      alignItems: "center",
      padding: "8px 0",
      borderBottom: "1px solid #f0f0f0",
    }}>
      <span style={{ fontSize: "14px", color: "#1e293b", fontWeight: 500 }}>{medicine}</span>
      <span style={{ fontSize: "13px", color: "#64748b" }}>{dosage}</span>
      <span style={{ fontSize: "13px", color: "#64748b" }}>{frequency}</span>
      <button onClick={onDelete} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 0, display: "flex" }}>
        <Icons.Trash />
      </button>
    </div>
  );
}