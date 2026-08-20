import { Columns3, Rows3 } from "lucide-react";
import { Button } from "@/components/ui/button";

export type TaskView = "list" | "board";

export default function ViewToggle({
  view,
  onChange,
}: {
  view: TaskView;
  onChange: (view: TaskView) => void;
}) {
  return (
    <div className="hidden rounded-lg border p-0.5 md:flex">
      <Button
        variant={view === "list" ? "secondary" : "ghost"}
        size="sm"
        onClick={() => onChange("list")}
      >
        <Rows3 size={16} />
        List
      </Button>
      <Button
        variant={view === "board" ? "secondary" : "ghost"}
        size="sm"
        onClick={() => onChange("board")}
      >
        <Columns3 size={16} />
        Board
      </Button>
    </div>
  );
}
