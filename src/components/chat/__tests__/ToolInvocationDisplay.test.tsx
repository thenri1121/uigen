import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { getToolMessage, ToolInvocationDisplay } from "../ToolInvocationDisplay";

afterEach(() => { cleanup(); });

describe("getToolMessage", () => {
  describe("str_replace_editor", () => {
    it("returns 'Creating' for create command in progress", () => {
      const { label } = getToolMessage("str_replace_editor", { command: "create", path: "/App.jsx" }, false);
      expect(label).toBe("Creating App.jsx");
    });

    it("returns 'Created' for create command when done", () => {
      const { label } = getToolMessage("str_replace_editor", { command: "create", path: "/App.jsx" }, true);
      expect(label).toBe("Created App.jsx");
    });

    it("returns 'Editing' for str_replace command in progress", () => {
      const { label } = getToolMessage("str_replace_editor", { command: "str_replace", path: "/src/components/Button.tsx" }, false);
      expect(label).toBe("Editing Button.tsx");
    });

    it("returns 'Edited' for str_replace command when done", () => {
      const { label } = getToolMessage("str_replace_editor", { command: "str_replace", path: "/src/components/Button.tsx" }, true);
      expect(label).toBe("Edited Button.tsx");
    });

    it("returns 'Editing' for insert command in progress", () => {
      const { label } = getToolMessage("str_replace_editor", { command: "insert", path: "/index.tsx" }, false);
      expect(label).toBe("Editing index.tsx");
    });

    it("returns 'Reading' for view command in progress", () => {
      const { label } = getToolMessage("str_replace_editor", { command: "view", path: "/utils.ts" }, false);
      expect(label).toBe("Reading utils.ts");
    });

    it("returns 'Read' for view command when done", () => {
      const { label } = getToolMessage("str_replace_editor", { command: "view", path: "/utils.ts" }, true);
      expect(label).toBe("Read utils.ts");
    });

    it("extracts filename from nested path", () => {
      const { label } = getToolMessage("str_replace_editor", { command: "create", path: "/src/lib/helpers/format.ts" }, false);
      expect(label).toBe("Creating format.ts");
    });
  });

  describe("file_manager", () => {
    it("returns 'Deleting' for delete command in progress", () => {
      const { label } = getToolMessage("file_manager", { command: "delete", path: "/old.jsx" }, false);
      expect(label).toBe("Deleting old.jsx");
    });

    it("returns 'Deleted' for delete command when done", () => {
      const { label } = getToolMessage("file_manager", { command: "delete", path: "/old.jsx" }, true);
      expect(label).toBe("Deleted old.jsx");
    });

    it("returns 'Renaming' for rename command in progress", () => {
      const { label } = getToolMessage("file_manager", { command: "rename", path: "/old.jsx", new_path: "/new.jsx" }, false);
      expect(label).toBe("Renaming old.jsx to new.jsx");
    });

    it("returns 'Renamed' for rename command when done", () => {
      const { label } = getToolMessage("file_manager", { command: "rename", path: "/old.jsx", new_path: "/new.jsx" }, true);
      expect(label).toBe("Renamed old.jsx to new.jsx");
    });
  });

  describe("unknown tool", () => {
    it("falls back to tool name for unknown tools", () => {
      const { label } = getToolMessage("unknown_tool", {}, false);
      expect(label).toBe("unknown_tool");
    });
  });
});

describe("ToolInvocationDisplay", () => {
  it("shows in-progress label when state is call", () => {
    const tool = {
      toolName: "str_replace_editor",
      args: { command: "create", path: "/App.jsx" },
      state: "call" as const,
    };
    render(<ToolInvocationDisplay tool={tool} />);
    expect(screen.getByText("Creating App.jsx")).toBeDefined();
  });

  it("shows completed label when state is result", () => {
    const tool = {
      toolName: "str_replace_editor",
      args: { command: "create", path: "/App.jsx" },
      state: "result" as const,
      result: "ok",
    };
    render(<ToolInvocationDisplay tool={tool} />);
    expect(screen.getByText("Created App.jsx")).toBeDefined();
  });

  it("renders file_manager delete message", () => {
    const tool = {
      toolName: "file_manager",
      args: { command: "delete", path: "/src/old.tsx" },
      state: "result" as const,
      result: { success: true },
    };
    render(<ToolInvocationDisplay tool={tool} />);
    expect(screen.getByText("Deleted old.tsx")).toBeDefined();
  });
});
