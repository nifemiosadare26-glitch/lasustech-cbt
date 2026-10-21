/**
 * LASUSTECH CBT result slip generator.
 * Save as: src/lib/generateResultSlip.ts
 *
 * Requires:  npm install jspdf jspdf-autotable
 * Optional:  put your university logo at /public/logo.png (PNG or JPG).
 *            If it is missing, a monogram badge is drawn instead.
 */

import type { CellHookData } from "jspdf-autotable";

export type SlipCourse = {
  code: string;
  title: string;
  examScore: number;
  rawScore?: number;
  maxScore?: number;
  percent?: number;
  scoreLabel?: string;
  remark?: "Pass" | "Fail";
  semester: string;
  session: string;
};

export type SlipStudent = {
  names: string;
  matricNo: string;
  level: string;
  department: { name: string };
  college: { name: string };
};

export type SlipOptions = {
  student: SlipStudent;
  results: SlipCourse[];
  session: string;
  semester: string; // "All" | "Harmattan" | "Rain"
  logoUrl?: string; // defaults to /logo.png
};

type RGB = [number, number, number];

const BRAND = {
  navy: [23, 37, 84] as RGB,
  blue: [37, 99, 235] as RGB,
  gold: [202, 162, 66] as RGB,
  ink: [30, 41, 59] as RGB,
  muted: [100, 116, 139] as RGB,
  line: [226, 232, 240] as RGB,
  panel: [241, 245, 249] as RGB,
  green: [4, 120, 87] as RGB,
  red: [190, 18, 60] as RGB,
};

const UNIVERSITY = "LAGOS STATE UNIVERSITY OF SCIENCE AND TECHNOLOGY";
const SHORT_NAME = "LASUSTECH";

function loadImage(
  src: string
): Promise<{ data: string; w: number; h: number } | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        canvas.getContext("2d")!.drawImage(img, 0, 0);
        resolve({
          data: canvas.toDataURL("image/png"),
          w: img.naturalWidth,
          h: img.naturalHeight,
        });
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function formatDateTime(d: Date) {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return `${pad(d.getDate())} ${months[d.getMonth()]} ${d.getFullYear()}, ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

function scoreText(r: SlipCourse) {
  if (r.rawScore !== undefined && r.maxScore !== undefined) {
    return `${r.rawScore} / ${r.maxScore}`;
  }
  return r.scoreLabel ?? `${r.examScore} / 100`;
}

function remarkOf(r: SlipCourse): "Pass" | "Fail" {
  return r.remark ?? (r.examScore <= 30 ? "Fail" : "Pass");
}

export async function generateResultSlip(opts: SlipOptions) {
  const { student, results, session, semester } = opts;

  // Loaded on demand so the PDF libraries stay out of the main bundle
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const M = 14;
  const now = new Date();
  const slipRef = `LSU-${student.matricNo.replace(/[^A-Za-z0-9]/g, "")}-${now
    .getTime()
    .toString(36)
    .toUpperCase()}`;

  /* ------------------------------- Header band ------------------------------ */
  doc.setFillColor(...BRAND.navy);
  doc.rect(0, 0, pageW, 40, "F");
  doc.setFillColor(...BRAND.gold);
  doc.rect(0, 40, pageW, 1.6, "F");

  // Logo (or monogram fallback)
  const logo = await loadImage(opts.logoUrl ?? "/logo.png");
  const badgeX = M;
  const badgeY = 8;
  const badge = 24;
  doc.setFillColor(255, 255, 255);
  doc.circle(badgeX + badge / 2, badgeY + badge / 2, badge / 2, "F");
  if (logo) {
    const max = badge - 5;
    const ratio = logo.w / logo.h;
    const w = ratio >= 1 ? max : max * ratio;
    const h = ratio >= 1 ? max / ratio : max;
    doc.addImage(
      logo.data,
      "PNG",
      badgeX + (badge - w) / 2,
      badgeY + (badge - h) / 2,
      w,
      h
    );
  } else {
    doc.setTextColor(...BRAND.navy);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("L", badgeX + badge / 2, badgeY + badge / 2 + 2.6, {
      align: "center",
    });
  }

  const textX = badgeX + badge + 7;
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12.5);
  doc.text(UNIVERSITY, textX, 16);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(191, 219, 254);
  doc.text("Academic Registry  |  Computer Based Testing (CBT) Portal", textX, 22.5);
  doc.setFontSize(8);
  doc.setTextColor(...BRAND.gold);
  doc.text(`${SHORT_NAME}  -  OFFICIAL EXAMINATION RECORD`, textX, 29);

  /* --------------------------------- Title ---------------------------------- */
  doc.setTextColor(...BRAND.navy);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text("STATEMENT OF EXAMINATION RESULTS", pageW / 2, 54, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...BRAND.muted);
  const semLabel = semester === "All" ? "All Semesters" : `${semester} Semester`;
  doc.text(`Academic Session ${session}  |  ${semLabel}`, pageW / 2, 60, {
    align: "center",
  });

  /* ------------------------------ Student panel ----------------------------- */
  const panelY = 67;
  const panelH = 40;
  doc.setFillColor(...BRAND.panel);
  doc.setDrawColor(...BRAND.line);
  doc.roundedRect(M, panelY, pageW - M * 2, panelH, 2.5, 2.5, "FD");
  doc.setFillColor(...BRAND.blue);
  doc.rect(M, panelY + 3, 1.2, panelH - 6, "F");

  const colA = M + 7;
  const colB = pageW / 2 + 4;
  const field = (label: string, value: string, x: number, y: number, maxW: number) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...BRAND.muted);
    doc.text(label.toUpperCase(), x, y);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...BRAND.ink);
    const lines = doc.splitTextToSize(value, maxW) as string[];
    doc.text(lines[0] ?? "", x, y + 5);
  };
  const halfW = pageW / 2 - M - 12;
  field("Student Name", student.names, colA, panelY + 9, halfW);
  field("Matric Number", student.matricNo, colB, panelY + 9, halfW);
  field("Department", student.department.name, colA, panelY + 21, halfW);
  field("Level", student.level, colB, panelY + 21, halfW);
  field("College", student.college.name, colA, panelY + 33, halfW);
  field("Slip Reference", slipRef, colB, panelY + 33, halfW);

  /* ---------------------------------- Table --------------------------------- */
  const body = results.map((r, i) => [
    String(i + 1),
    r.code,
    r.title,
    scoreText(r),
    `${r.percent ?? r.examScore}%`,
    remarkOf(r),
  ]);

  autoTable(doc, {
    startY: panelY + panelH + 8,
    margin: { left: M, right: M, top: 16, bottom: 26 },
    head: [["S/N", "Course Code", "Course Title", "Score", "%", "Remark"]],
    body,
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 9,
      cellPadding: 3,
      lineColor: BRAND.line,
      lineWidth: 0.2,
      textColor: BRAND.ink,
      valign: "middle",
    },
    headStyles: {
      fillColor: BRAND.navy,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 12, halign: "center" },
      1: { cellWidth: 28, fontStyle: "bold" },
      2: { cellWidth: "auto" },
      3: { cellWidth: 26, halign: "center", fontStyle: "bold" },
      4: { cellWidth: 20, halign: "center" },
      5: { cellWidth: 24, halign: "center", fontStyle: "bold" },
    },
    didParseCell: (h: CellHookData) => {
      if (h.section === "head" && (h.column.index === 1 || h.column.index === 2)) {
        h.cell.styles.halign = "left";
      }
      if (h.section === "body" && h.column.index === 5) {
        h.cell.styles.textColor = h.cell.text.join("") === "Fail" ? BRAND.red : BRAND.green;
      }
    },
  });

  let y =
    (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

  /* --------------------------------- Summary -------------------------------- */
  const total = results.length;
  const failed = results.filter((r) => remarkOf(r) === "Fail").length;
  const passed = total - failed;
  const avg = total
    ? Math.round(
        (results.reduce((s, r) => s + (r.percent ?? r.examScore), 0) / total) * 10
      ) / 10
    : 0;

  if (y + 52 > pageH - 26) {
    doc.addPage();
    y = 20;
  }

  const stats: Array<[string, string, RGB]> = [
    ["Papers", String(total), BRAND.navy],
    ["Passed", String(passed), BRAND.green],
    ["Failed", String(failed), failed ? BRAND.red : BRAND.muted],
    ["Average", `${avg}%`, BRAND.blue],
  ];
  const gap = 4;
  const boxW = (pageW - M * 2 - gap * 3) / 4;
  stats.forEach(([label, value, color], i) => {
    const x = M + i * (boxW + gap);
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...BRAND.line);
    doc.roundedRect(x, y, boxW, 18, 2, 2, "FD");
    doc.setFillColor(...color);
    doc.rect(x, y + 3, 1, 12, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...BRAND.muted);
    doc.text(label.toUpperCase(), x + 5, y + 7);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...color);
    doc.text(value, x + 5, y + 14.5);
  });
  y += 30;

  /* -------------------------------- Signatures ------------------------------ */
  const sigW = 60;
  doc.setDrawColor(...BRAND.muted);
  doc.setLineWidth(0.3);
  doc.line(M, y + 12, M + sigW, y + 12);
  doc.line(pageW - M - sigW, y + 12, pageW - M, y + 12);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...BRAND.muted);
  doc.text("Examination Officer", M, y + 17);
  doc.text("Registrar / Academic Registry", pageW - M - sigW, y + 17);

  /* ------------------------- Watermark + footer per page -------------------- */
  const pages = doc.getNumberOfPages();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const d = doc as any;
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);

    // Watermark
    d.setGState(new d.GState({ opacity: 0.05 }));
    doc.setFont("helvetica", "bold");
    doc.setFontSize(78);
    doc.setTextColor(...BRAND.navy);
    doc.text(SHORT_NAME, pageW / 2, pageH / 2 + 20, { align: "center", angle: 35 });
    d.setGState(new d.GState({ opacity: 1 }));

    // Footer
    doc.setDrawColor(...BRAND.gold);
    doc.setLineWidth(0.6);
    doc.line(M, pageH - 18, pageW - M, pageH - 18);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...BRAND.muted);
    doc.text(`Ref: ${slipRef}`, M, pageH - 13);
    doc.text(`Generated: ${formatDateTime(now)}`, pageW / 2, pageH - 13, {
      align: "center",
    });
    doc.text(`Page ${p} of ${pages}`, pageW - M, pageH - 13, { align: "right" });
    doc.setFontSize(7);
    doc.text(
      `Computer-generated document from the ${SHORT_NAME} CBT Portal.`,
      pageW / 2,
      pageH - 8.5,
      { align: "center" }
    );
  }

  const safe = (s: string) => s.replace(/[^A-Za-z0-9]+/g, "-");
  doc.save(`${SHORT_NAME}_Result_Slip_${safe(student.matricNo)}_${safe(session)}.pdf`);
}