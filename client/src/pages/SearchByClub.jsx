import React, { useState, useMemo } from "react";
import Card from "../components/Card.jsx";
import DataTable from "../components/DataTable.jsx";
import { downloadCSV } from "../utils/DataUtils.js";

export default function SearchByClub({ responses = [], allStudents = [] }) {
  const [selectedClub, setSelectedClub] = useState("");
  const [filterYear, setFilterYear] = useState("");

  // Build a lookup table for registration number → year
  const regToYear = useMemo(() => {
    const map = {};
    allStudents.forEach(s => {
      if (s["Registration Number"]) map[s["Registration Number"]] = s.Year;
    });
    return map;
  }, [allStudents]);

  const allClubs = useMemo(() => {
    const s = new Set();
    responses.forEach(r => { 
      ["Club 1","Club 2"].forEach(k => r[k] && s.add(r[k])); 
    });
    return Array.from(s).sort();
  }, [responses]);

  const allYears = useMemo(() => {
    const s = new Set();
    allStudents.forEach(sv => { if (sv.Year) s.add(sv.Year); });
    return Array.from(s).sort();
  }, [allStudents]);

  const clubData = useMemo(() => {
    if (!selectedClub) return [];

    // Map year from allStudents into each response
    return responses
      .filter(r => (r["Club 1"] === selectedClub || r["Club 2"] === selectedClub))
      .map(r => ({ ...r, Year: regToYear[r["Registration Number"]] || "" }))
      .filter(r => !filterYear || r.Year === filterYear);
  }, [selectedClub, responses, filterYear, regToYear]);

  return (
    <Card>
      <h2>Search by Club</h2>

      <div style={{display:"flex", gap:8, marginTop:12}}>
        <select value={selectedClub} onChange={e=>{setSelectedClub(e.target.value); setFilterYear("");}} className="search-select" style={{padding:8,borderRadius:8}}>
          <option value="">-- Select a Club --</option>
          {allClubs.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <select value={filterYear} onChange={e=>setFilterYear(e.target.value)} className="search-select" style={{padding:8,borderRadius:8}}>
          <option value="">All Years</option>
          {allYears.map(y => <option key={y} value={y}>{y}</option>)}
        </select>

        <button
  className="button btn-green"
  onClick={() => {
    // Map clubData to only include desired columns
    const csvData = clubData.map(r => ({
      Name: r.Name,
      "Registration Number": r["Registration Number"],
      Department: r.Department,
      Year: regToYear[r["Registration Number"]] || ""
    }));
    downloadCSV(csvData, `${selectedClub || "club"}_members.csv`);
  }}
>
  ⬇ Download
</button>
      </div>

      {selectedClub && (
        <div style={{marginTop:12}}>
          {clubData.length > 0 ? (
            <div style={{maxHeight:320, overflowY:"auto"}}>
              <DataTable headers={["Name","Registration Number","Department","Year"]} data={clubData} />
            </div>
          ) : (
            <div className="card" style={{background:"#fff3cd", color:"#92400e"}}>No students found in {selectedClub} (with selected filters).</div>
          )}
        </div>
      )}
    </Card>
  );
}