import React, { useState, useMemo } from "react";
import Card from "../components/Card.jsx";
import DataTable from "../components/DataTable.jsx";

export default function SearchByRegNo({ responses = [] }) {
  const [regNo, setRegNo] = useState("");
  const result = useMemo(() => {
    if (!regNo) return [];
    return responses.filter(r => (r["Registration Number"] || "").toLowerCase() === regNo.toLowerCase());
  }, [regNo, responses]);

  return (
    <Card>
      <h2>Search by Registration Number</h2>
      <div style={{marginTop:12, display:"flex", gap:8}}>
        <input value={regNo} onChange={e=>setRegNo(e.target.value)} className="search-input" placeholder="Enter Registration Number" style={{flex:1,padding:8,borderRadius:8,border:"1px solid #e6eef6"}} />
      </div>

      {regNo && (
        <div style={{marginTop:12}}>
          {result.length > 0 ? (
            <DataTable headers={["Name","Registration Number","Department","Phone Number","Club 1","Club 2"]} data={result} />
          ) : (
            <div className="card" style={{background:"#fff3cd", color:"#92400e"}}>No student found with Registration Number <b>{regNo}</b></div>
          )}
        </div>
      )}
    </Card>
  );
}