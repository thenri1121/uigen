import { Loader2, FilePlus, FilePen, FileSearch, Trash2, FolderInput, Check } from "lucide-react";

interface ToolInvocation {
  toolName: string;
  args: Record<string, unknown>;
  state: "call" | "partial-call" | "result";
  result?: unknown;
}

interface ToolInvocationDisplayProps {
  tool: ToolInvocation;
}

interface ToolMessage {
  icon: React.ReactNode;
  label: string;
}

export function getToolMessage(toolName: string, args: Record<string, unknown>, done: boolean): ToolMessage {
  if (toolName === "str_replace_editor") {
    const command = args.command as string;
    const path = args.path as string;
    const filename = path?.split("/").pop() ?? path;

    switch (command) {
      case "create":
        return {
          icon: <FilePlus className="w-3 h-3" />,
          label: done ? `Created ${filename}` : `Creating ${filename}`,
        };
      case "str_replace":
      case "insert":
        return {
          icon: <FilePen className="w-3 h-3" />,
          label: done ? `Edited ${filename}` : `Editing ${filename}`,
        };
      case "view":
        return {
          icon: <FileSearch className="w-3 h-3" />,
          label: done ? `Read ${filename}` : `Reading ${filename}`,
        };
      default:
        return {
          icon: <FilePen className="w-3 h-3" />,
          label: done ? `Updated ${filename}` : `Updating ${filename}`,
        };
    }
  }

  if (toolName === "file_manager") {
    const command = args.command as string;
    const path = args.path as string;
    const newPath = args.new_path as string | undefined;
    const filename = path?.split("/").pop() ?? path;
    const newFilename = newPath?.split("/").pop() ?? newPath;

    switch (command) {
      case "delete":
        return {
          icon: <Trash2 className="w-3 h-3" />,
          label: done ? `Deleted ${filename}` : `Deleting ${filename}`,
        };
      case "rename":
        return {
          icon: <FolderInput className="w-3 h-3" />,
          label: done
            ? `Renamed ${filename} to ${newFilename}`
            : `Renaming ${filename} to ${newFilename}`,
        };
    }
  }

  return {
    icon: <FilePen className="w-3 h-3" />,
    label: toolName,
  };
}

export function ToolInvocationDisplay({ tool }: ToolInvocationDisplayProps) {
  const done = tool.state === "result";
  const { icon, label } = getToolMessage(tool.toolName, tool.args, done);

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs border border-neutral-200">
      {done ? (
        <Check className="w-3 h-3 text-emerald-500 shrink-0" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600 shrink-0" />
      )}
      <span className="text-neutral-600">{icon}</span>
      <span className="text-neutral-700">{label}</span>
    </div>
  );
}
