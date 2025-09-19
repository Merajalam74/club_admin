import React, { useMemo } from "react";
import Card from "../components/Card.jsx";
import DataTable from "../components/DataTable.jsx";
import { downloadCSV } from "../utils/DataUtils.js";

export default function JoinedAtLeastOneClub({ responses = [] }) {
  const joined = useMemo(()=> responses.filter(r => r["Club 1"] || r["Club 2"]), [responses]);

  return (
    <Card>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
        <h2>Students Who Joined At Least One Club</h2>
        <button className="button btn-green" onClick={()=>downloadCSV(joined, "students_joined_clubs.csv")}>⬇ Download</button>
      </div>

      <div style={{marginTop:12, maxHeight:360, overflowY:"auto"}}>
        <DataTable headers={["Name","Registration Number","Department","Club 1","Club 2"]} data={joined} />
      </div>
    </Card>
  );
}