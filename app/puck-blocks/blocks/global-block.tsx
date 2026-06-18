// @ts-nocheck
import {
  StackedTextField,
} from "@/puck-blocks/shared";

export const GlobalBlockComponent = {
  fields: {
    globalBlockId: {
      type: "custom",

      label: "Block ID (do not edit)",

      render: ({ value, onChange }) => (
        <StackedTextField
          label="Block ID"
          value={value}
          onChange={onChange}
          placeholder="Block ID..."
        />
      ),
    },

    _name: {
      type: "custom",

      label: "Block Name (do not edit)",

      render: ({ value, onChange }) => (
        <StackedTextField
          label="Block Name"
          value={value}
          onChange={onChange}
          placeholder="Block Name..."
        />
      ),
    },
  },

  defaultProps: {
    globalBlockId: "",

    _name: "Global Block",
  },

  render: ({ globalBlockId, _name }: any) => (
    <div
      style={{
        border: "2px dashed #0158ad",

        borderRadius: 8,

        padding: "20px 16px",

        background: "#eff6ff",

        display: "flex",

        flexDirection: "column",

        alignItems: "center",

        gap: 6,

        userSelect: "none",

        pointerEvents: "none",
      }}
    >
      <span style={{ fontSize: 24 }}>🌐</span>

      <span style={{ fontWeight: 600, fontSize: 14, color: "#0158ad" }}>
        {_name || "Global Block"}
      </span>

      <span style={{ fontSize: 11, color: "#5b9bd5" }}>
        ID: {globalBlockId}
      </span>

      <span style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>
        Edit from the Global Blocks panel → changes reflect on all pages
      </span>
    </div>
  ),
};
