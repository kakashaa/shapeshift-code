import jsPDF from "jspdf";
import "jspdf-autotable";

// ── CSV/Excel Export (native CSV, opens in Excel) ──
export function exportToCSV(data: Record<string, any>[], filename: string) {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const csvRows = [
    "\uFEFF" + headers.join(","), // BOM for Arabic support
    ...data.map((row) =>
      headers.map((h) => `"${String(row[h] ?? "").replace(/"/g, '""')}"`).join(",")
    ),
  ];
  const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, `${filename}.csv`);
}

// ── PDF Export ──
export function exportToPDF(
  title: string,
  headers: string[],
  rows: (string | number)[][],
  filename: string,
  summary?: { label: string; value: string }[]
) {
  const doc = new jsPDF({ orientation: "landscape" });

  // Title
  doc.setFontSize(16);
  doc.text(title, doc.internal.pageSize.getWidth() / 2, 15, { align: "center" });

  // Summary section
  let startY = 25;
  if (summary?.length) {
    doc.setFontSize(10);
    summary.forEach((s, i) => {
      doc.text(`${s.label}: ${s.value}`, doc.internal.pageSize.getWidth() - 14, startY + i * 7, {
        align: "right",
      });
    });
    startY += summary.length * 7 + 5;
  }

  // Table
  (doc as any).autoTable({
    head: [headers],
    body: rows,
    startY,
    styles: { fontSize: 9, halign: "center" },
    headStyles: { fillColor: [30, 130, 200], halign: "center" },
    alternateRowStyles: { fillColor: [245, 247, 250] },
  });

  doc.save(`${filename}.pdf`);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
