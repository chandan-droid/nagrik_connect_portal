import { jsx } from "react/jsx-runtime";
import { statusLabels, statusColors } from "@/lib/mock-data";

function normalizeBadgeStatus(status) {
  return String(status || "submitted").trim().toLowerCase().replace(/_/g, "-");
}

function formatFallbackLabel(status) {
  return String(status || "submitted")
    .replace(/_/g, "-")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function StatusBadge({ status }) {
  const normalized = normalizeBadgeStatus(status);
  const colorClass = statusColors[normalized] || "bg-muted text-muted-foreground border border-border font-medium";
  const label = statusLabels[normalized] || formatFallbackLabel(normalized);

  return /* @__PURE__ */ jsx("span", {
    className: `inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${colorClass}`,
    children: label
  });
}
export {
  StatusBadge as default
};
