import React from "react";

export default function DataTable({ headers, data, maxHeight = 320 }) {
  return (
    <div className="table-wrap" style={{ maxHeight, overflowY: "auto" }}>
      <table className="table">
        <thead>
          <tr>
            {headers.map(h => <th key={h}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? data.map((row, i) => (
            <tr key={i} style={{ background: i % 2 ? "#fff" : "#fbfdff" }}>
              {headers.map(h => <td key={h + i}>{row[h] ?? ""}</td>)}
            </tr>
          )) : (
            <tr><td colSpan={headers.length} style={{ padding:16, textAlign:"center" }}>No data</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}