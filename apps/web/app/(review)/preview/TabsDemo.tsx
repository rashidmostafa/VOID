"use client";

import * as React from "react";
import { Tabs, TabPanel } from "@void/ui/navigation/Tabs";
import { Icon } from "@void/ui/core/Icon";

/* Tabs owns no state — the parent does — so the preview needs a holder.
   Both variants are rendered so the gate sees each under both token sets. */
export function TabsDemo() {
  const [section, setSection] = React.useState("details");
  const [range, setRange] = React.useState("30d");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      <div>
        <Tabs
          idPrefix="pdp"
          label="Product information"
          value={section}
          onChange={setSection}
          items={[
            { value: "details", label: "Details", icon: <Icon name="info" size="sm" /> },
            { value: "care", label: "Care" },
            { value: "delivery", label: "Delivery", icon: <Icon name="truck" size="sm" /> },
            { value: "returns", label: "Returns", count: 2 },
          ]}
        />
        <TabPanel idPrefix="pdp" value="details" selected={section}>
          <p style={{ font: "var(--type-body)" }}>
            Handwoven cotton, made to order in Dhaka. 7–10 days.
          </p>
        </TabPanel>
        <TabPanel idPrefix="pdp" value="care" selected={section}>
          <p style={{ font: "var(--type-body)" }}>Cold hand wash. Dry flat in shade. Do not bleach.</p>
        </TabPanel>
        <TabPanel idPrefix="pdp" value="delivery" selected={section}>
          <p style={{ font: "var(--type-body)" }}>
            Next-day in 14 districts. Cross-border shipments can be extended by customs clearance.
          </p>
        </TabPanel>
        <TabPanel idPrefix="pdp" value="returns" selected={section}>
          <p style={{ font: "var(--type-body)" }}>14 days, unworn, tags on. Custom pieces are not returnable.</p>
        </TabPanel>
      </div>

      <Tabs
        idPrefix="range"
        label="Reporting period"
        variant="segmented"
        size="sm"
        value={range}
        onChange={setRange}
        items={["7d", "30d", "90d", "Year"]}
      />
    </div>
  );
}
