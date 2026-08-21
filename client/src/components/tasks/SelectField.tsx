import { Controller, type Control, type FieldPath } from "react-hook-form";
import type { TaskForm } from "@/schemas/taskSchemas";
import FormField from "@/components/FormField";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SelectField({
  control,
  name,
  label,
  options,
}: {
  control: Control<TaskForm>;
  name: FieldPath<TaskForm>;
  label: string;
  options: { value: string; label: string }[];
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <FormField id={name} label={label}>
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger id={name} className="w-full">
              <SelectValue>
                {(value) =>
                  options.find((option) => option.value === value)?.label ??
                  (value as string)
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      )}
    />
  );
}
