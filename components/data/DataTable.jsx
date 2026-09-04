import React from "react";

/* Dense record table shared by the vendor portal and admin back office. */

export function DataTable({ columns = [], rows = [], selectable = false, dense = false, empty = "No records", onRowClick, style }) {
  const [selected, setSelected] = React.useState([]);
  const rowH = dense ? 38 : 48;
  const toggle = (i) => setSelected((s) => (s.includes(i) ? s.filter((x) => x !== i) : s.concat(i)));

  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden", background: "var(--surface-card)", ...style }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-sans)" }}>
        <thead>
          <tr style={{ background: "var(--muted)" }}>
            {selectable ? <th style={{ width: 40, padding: "0 var(--space-4)" }} /> : null}
            {columns.map((c) => (
              <th
                key={c.key}
                style={{
                  textAlign: c.align || "left",
                  padding: "var(--space-3) var(--space-4)",
                  fontSize: "var(--text-2xs)",
                  fontWeight: "var(--weight-medium)",
                  textTransform: "uppercase",
                  letterSpacing: "var(--tracking-widest)",
                  color: "var(--text-muted)",
                  whiteSpace: "nowrap",
                  width: c.width,
                }}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={columns.length + (selectable ? 1 : 0)} style={{ padding: "var(--space-10)", textAlign: "center", color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>{empty}</td></tr>
          ) : (
            rows.map((row, i) => (
              <tr
                key={row.id || i}
                onClick={() => onRowClick && onRowClick(row)}
                style={{ height: rowH, borderTop: "1px solid var(--border)", cursor: onRowClick ? "pointer" : "default", background: selected.includes(i) ? "var(--muted)" : "transparent" }}
              >
                {selectable ? (
                  <td style={{ padding: "0 var(--space-4)" }}>
                    <input type="checkbox" checked={selected.includes(i)} onChange={() => toggle(i)} onClick={(e) => e.stopPropagation()} style={{ accentColor: "var(--primary)" }} />
                  </td>
                ) : null}
                {columns.map((c) => (
                  <td
                    key={c.key}
                    style={{
                      padding: "0 var(--space-4)",
                      textAlign: c.align || "left",
                      fontSize: "var(--text-sm)",
                      color: c.muted ? "var(--text-muted)" : "var(--foreground)",
                      fontVariantNumeric: c.numeric ? "tabular-nums" : "normal",
                      fontFamily: c.mono ? "var(--font-mono)" : "inherit",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {c.render ? c.render(row) : row[c.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
