import React, { useMemo } from "react";
import Card from "../components/Card.jsx";
import DataTable from "../components/DataTable.jsx";
import { downloadCSV } from "../utils/DataUtils.js";

export default function NotResponded({ responses = [], allStudents = [] }) {
  const notResponded = useMemo(() => {
    const respSet = new Set(responses.map(r => r["Registration Number"]));
    return allStudents.filter(s => !respSet.has(s["Registration Number"]));
  }, [responses, allStudents]);

  const grouped = useMemo(()=>{
    return notResponded.reduce((acc, s) => {
      const y = s.Year || "Unknown";
      if (!acc[y]) acc[y] = [];
      acc[y].push(s);
      return acc;
    }, {});
  }, [notResponded]);

  const years = Object.keys(grouped).sort();

  return (
    <Card>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
        <h2>Students Who Have Not Responded</h2>
        <button className="button btn-green" onClick={()=>downloadCSV(notResponded, "all_not_responded.csv")}>⬇ Download All</button>
      </div>

      <div style={{marginTop:12}}>
        <div style={{marginBottom:12}} className="card">📊 Total Not Responded: <strong>{notResponded.length}</strong></div>

        {years.map(y => (
          <div key={y} style={{marginBottom:14}}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8}}>
              <h3>📌 Year {y} ({grouped[y].length})</h3>
              <button className="button" onClick={() => downloadCSV(grouped[y], `year_${y}_not_responded.csv`)}>⬇ Download Year {y}</button>
            </div>
            <div style={{maxHeight:260, overflowY:"auto"}}>
              <DataTable headers={["Name","Registration Number","Department","Year"]} data={grouped[y]} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}