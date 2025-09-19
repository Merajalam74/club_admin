import React from "react";
import Card from "./Card.jsx";

export default function MetricCard({ title, value }) {
  return (
    <Card>
      <div style={{color:"#85a0c7ff",fontSize:13}}>{title}</div>
      <div style={{fontSize:28,fontWeight:700,marginTop:8}}>{value}</div>
    </Card>
  );
}