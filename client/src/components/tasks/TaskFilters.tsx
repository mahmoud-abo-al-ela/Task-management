import { Search, X } from "lucide-react";
import { statusOptions, priorityOptions } from "@/lib/taskOptions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function toFilterValue(value: string | null) {
  return !value || value === "all" ? "" : value;
}

const statusFilterOptions = [
  { value: "all", label: "All statuses" },
  ...statusOptions,
];

const priorityFilterOptions = [
  { value: "all", label: "All priorities" },
  ...priorityOptions,
];

function labelFor(options: { value: string; label: string }[], value: string) {
  return options.find((option) => option.value === value)?.label ?? value;
}

interface TaskFiltersProps {
  search: string;
  status: string;
  priority: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onPriorityChange: (value: string) => void;
  onClear: () => void;
  hasFilters: boolean;
}

export default function TaskFilters({
  search,
  status,
  priority,
  onSearchChange,
  onStatusChange,
  onPriorityChange,
  onClear,
  hasFilters,
}: TaskFiltersProps) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row">
      <div className="relative flex-1">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by title"
          aria-label="Search tasks by title"
          className="pl-9"
        />
      </div>

      <div className="flex gap-3">
        <Select
          value={status || "all"}
          onValueChange={(value) => onStatusChange(toFilterValue(value))}
        >
          <SelectTrigger
            className="flex-1 sm:w-36"
            aria-label="Filter by status"
          >
            <SelectValue>
              {(value) => labelFor(statusFilterOptions, value as string)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {statusFilterOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={priority || "all"}
          onValueChange={(value) => onPriorityChange(toFilterValue(value))}
        >
          <SelectTrigger
            className="flex-1 sm:w-36"
            aria-label="Filter by priority"
          >
            <SelectValue>
              {(value) => labelFor(priorityFilterOptions, value as string)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {priorityFilterOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClear}
            aria-label="Clear filters"
          >
            <X size={16} />
          </Button>
        )}
      </div>
    </div>
  );
}
