// Dashboard.jsx
import React, { useMemo } from "react";
import Card from "../components/Card.jsx";
import MetricCard from "../components/MetricCard.jsx";
import ChartComponent from "../components/ChartComponent.jsx";
import DataTable from "../components/DataTable.jsx";

const chartColors = [
  "#38bdf8", "#fb923c", "#4ade80", "#f87171",
  "#a78bfa", "#fbbf24", "#2dd4bf", "#f472b6"
];

export default function Dashboard({ responses = [], allStudents = [] }) {

  // ---------------- CLUB PARTICIPATION ----------------
  const clubParticipation = useMemo(() => {
    if (!responses.length) return { labels: [], data: [] };
    const counts = responses
      .flatMap(r => [r['Club 1'], r['Club 2']])
      .filter(Boolean)
      .reduce((acc, club) => {
        acc[club] = (acc[club] || 0) + 1;
        return acc;
      }, {});
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return { labels: sorted.map(s => s[0]), data: sorted.map(s => s[1]) };
  }, [responses]);

  // ---------------- ONE vs TWO CLUBS ----------------
  const oneVsTwoClubs = useMemo(() => {
    if (!responses.length) return { labels: [], data: [] };
    const counts = responses.reduce((acc, r) => {
      const clubCount = (r['Club 1'] ? 1 : 0) + (r['Club 2'] ? 1 : 0);
      if (clubCount > 0) {
        const key = `${clubCount} Club${clubCount > 1 ? 's' : ''}`;
        acc[key] = (acc[key] || 0) + 1;
      }
      return acc;
    }, {});
    return { labels: Object.keys(counts), data: Object.values(counts) };
  }, [responses]);

  // ---------------- DEPARTMENT PARTICIPATION ----------------
  const departmentParticipation = useMemo(() => {
    if (!responses.length) return { labels: [], data: [] };
    const counts = responses.reduce((acc, r) => {
      acc[r.Department] = (acc[r.Department] || 0) + 1;
      return acc;
    }, {});
    return { labels: Object.keys(counts), data: Object.values(counts) };
  }, [responses]);

  // ---------------- YEAR PARTICIPATION ----------------
  const yearParticipation = useMemo(() => {
    if (!responses.length || !allStudents.length) return { labels: [], data: [] };
    const studentYearMap = allStudents.reduce((acc, s) => {
      acc[s['Registration Number']] = s.Year;
      return acc;
    }, {});
    const counts = responses.reduce((acc, r) => {
      const y = studentYearMap[r['Registration Number']];
      if (y) acc[y] = (acc[y] || 0) + 1;
      return acc;
    }, {});
    const sorted = Object.entries(counts).sort((a, b) => a[0] - b[0]);
    return { labels: sorted.map(s => `Year ${s[0]}`), data: sorted.map(s => s[1]) };
  }, [responses, allStudents]);

  // ---------------- YEAR PARTICIPATION % ----------------
  const yearParticipationPercentage = useMemo(() => {
    if (!responses.length || !allStudents.length) return [];
    const responded = new Set(responses.map(r => r['Registration Number']));
    const stats = allStudents.reduce((acc, s) => {
      const y = s.Year || "Unknown";
      if (!acc[y]) acc[y] = { joined: 0, total: 0 };
      acc[y].total++;
      if (responded.has(s['Registration Number'])) acc[y].joined++;
      return acc;
    }, {});
    return Object.entries(stats)
      .sort((a, b) => a[0] - b[0])
      .map(([year, st]) => ({
        year,
        labels: ['Joined', 'Not Joined'],
        data: [st.joined, st.total - st.joined],
        joinedPercent: st.total ? ((st.joined / st.total * 100).toFixed(2)) : "0.00",
        notJoinedPercent: st.total ? (((st.total - st.joined) / st.total * 100).toFixed(2)) : "0.00"
      }));
  }, [responses, allStudents]);

  // Latest responses
  const latestResponses = responses.slice(-5).reverse();

  // Chart Options
  const barOptions = { responsive: true, plugins: { legend: { display: false } } };
  const pieOptions = { responsive: true, plugins: { legend: { position: 'top' } } };

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>College Club Dashboard</h1>
      <p className="text-muted">Welcome to the Club Management Tool</p>

      <div className="metrics-grid" style={{ marginTop: 16 }}>
        <MetricCard title="Total Students Joined Any Club" value={responses.length} />
        <MetricCard title="Total Students" value={allStudents.length} />
      </div>

      {/* CLUB PARTICIPATION */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
        <Card className="card">
          <h3>Club Participation</h3>
          <div style={{ height: 260 }}>
            <ChartComponent
              type="bar"
              data={{
                labels: clubParticipation.labels,
                datasets: [{
                  label: "Students",
                  data: clubParticipation.data,
                  backgroundColor: chartColors
                }]
              }}
              options={barOptions}
            />
          </div>
        </Card>

        <Card>
          <h3>Students Joining One vs Two Clubs</h3>
          <div style={{ height: 260 }}>
            <ChartComponent
              type="pie"
              data={{
                labels: oneVsTwoClubs.labels,
                datasets: [{
                  data: oneVsTwoClubs.data,
                  backgroundColor: chartColors
                }]
              }}
              options={pieOptions}
            />
          </div>
        </Card>
      </div>

      {/* DEPARTMENT + YEAR PARTICIPATION */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
        <Card>
          <h3>Department-wise Participation</h3>
          <div style={{ height: 220 }}>
            <ChartComponent
              type="doughnut"
              data={{
                labels: departmentParticipation.labels,
                datasets: [{
                  data: departmentParticipation.data,
                  backgroundColor: chartColors
                }]
              }}
              options={pieOptions}
            />
          </div>
        </Card>

        <Card>
          <h3>Year-wise Participation</h3>
          <div style={{ height: 220 }}>
            <ChartComponent
              type="pie"
              data={{
                labels: yearParticipation.labels,
                datasets: [{
                  data: yearParticipation.data,
                  backgroundColor: chartColors
                }]
              }}
              options={pieOptions}
            />
          </div>
        </Card>
      </div>

      {/* YEAR % */}
      <Card className="card" style={{ marginTop: 16 }}>
        <h3>Year-wise Participation Percentage</h3>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
          gap: 12,
          marginTop: 12
        }}>
          {yearParticipationPercentage.map(yd => (
            <div key={yd.year}>
              <h4 style={{ textAlign: "center" }}>📌 Year {yd.year}</h4>
              <div style={{ height: 120 }}>
                <ChartComponent
                  type="pie"
                  data={{
                    labels: yd.labels,
                    datasets: [{
                      data: yd.data,
                      backgroundColor: ['#4ade80', '#f87171']
                    }]
                  }}
                  options={{ ...pieOptions, plugins: { legend: { display: false } } }}
                />
              </div>
              <div style={{ textAlign: "center", fontSize: 13, color: "#475569", marginTop: 6 }}>
                <div>✅ Joined: {yd.data[0]} ({yd.joinedPercent}%)</div>
                <div>🚫 Not Joined: {yd.data[1]} ({yd.notJoinedPercent}%)</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* LATEST RESPONSES */}
      <Card style={{ marginTop: 16 }}>
        <h3>Latest Responses</h3>
        <div style={{ marginTop: 8 }}>
          <DataTable
            headers={["Name", "Registration Number", "Department", "Club 1", "Club 2"]}
            data={latestResponses}
          />
        </div>
      </Card>
    </div>
  );
}