import { Controller, type Control } from "react-hook-form";
import { format } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import type { TaskForm } from "@/schemas/taskSchemas";
import FormField from "@/components/FormField";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function DateField({ control }: { control: Control<TaskForm> }) {
  return (
    <Controller
      control={control}
      name="dueDate"
      render={({ field }) => {
        const selected = field.value ? new Date(field.value) : undefined;

        return (
          <FormField id="dueDate" label="Due date">
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger
                  render={
                    <Button
                      id="dueDate"
                      type="button"
                      variant="outline"
                      className="flex-1 justify-start font-normal"
                    >
                      <CalendarIcon size={16} />
                      {selected ? (
                        format(selected, "d MMM yyyy")
                      ) : (
                        <span className="text-muted-foreground">
                          Pick a date
                        </span>
                      )}
                    </Button>
                  }
                />
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selected}
                    onSelect={(date) =>
                      field.onChange(date ? format(date, "yyyy-MM-dd") : "")
                    }
                    autoFocus
                  />
                </PopoverContent>
              </Popover>

              {field.value && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Clear due date"
                  onClick={() => field.onChange("")}
                >
                  <X size={16} />
                </Button>
              )}
            </div>
          </FormField>
        );
      }}
    />
  );
}
