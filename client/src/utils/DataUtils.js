import Papa from "papaparse";


export function parseCSV(text) {
  if (!text) return [];
  const result = Papa.parse(text.trim(), { header: true, skipEmptyLines: true });

  if (result.errors && result.errors.length) {
    console.warn("CSV parse warnings/errors:", result.errors);
  }

  return result.data || [];
}


export const parseCSVText = parseCSV;


export async function fetchCSV(url) {
  if (!url) throw new Error("No URL provided");

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Fetch failed with status ${response.status}`);

  const text = await response.text();
  return parseCSV(text);
}


export const fetchCSVText = fetchCSV;


export function downloadCSV(data, filename = "data.csv") {
  if (!data || !data.length) return;

  const header = Object.keys(data[0]).join(",");
  const rows = data
    .map((row) => Object.values(row).map((val) => `"${val}"`).join(","))
    .join("\n");
  const csvContent = [header, rows].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}