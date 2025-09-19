import React, { useMemo } from "react";
import Card from "../components/Card.jsx";
import DataTable from "../components/DataTable.jsx";
import { downloadCSV } from "../utils/DataUtils.js";

export default function DuplicateRegistrations({ responses = [] }) {
  const duplicates = useMemo(() => {
    const counts = responses.reduce((acc, r) => {
      const reg = r['Registration Number'];
      if (!reg) return acc;
      acc[reg] = (acc[reg] || 0) + 1; return acc;
    }, {});
    const dupRegs = Object.keys(counts).filter(k => counts[k] > 1);
    return responses.filter(r => dupRegs.includes(r['Registration Number'])).sort((a,b)=> (a['Registration Number']||"").localeCompare(b['Registration Number']||""));
  }, [responses]);

  return (
    <Card>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
        <h2>Duplicate Registrations</h2>
        {duplicates.length > 0 && <button className="button btn-danger" onClick={() => downloadCSV(duplicates, "duplicate_records.csv")}>⬇ Download Duplicates</button>}
      </div>

      <div style={{marginTop:12}}>
        {duplicates.length > 0 ? (
          <DataTable headers={["Name","Registration Number","Department","Club 1","Club 2"]} data={duplicates} />
        ) : (
          <div className="card" style={{background:"#ecfdf5", color:"#065f46"}}>✅ No duplicate registrations found!</div>
        )}
      </div>
    </Card>
  );
}