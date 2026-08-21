import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ImagePlus, X } from "lucide-react";
import type { Task } from "@/types";
import { useAttachment } from "@/hooks/useAttachment";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

// Matches the limit the server enforces.
const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2 MB

// .jpg and .jpeg are both image/jpeg, so two types cover all three extensions.
const ALLOWED_TYPES = ["image/png", "image/jpeg"];

interface AttachmentFieldProps {
  task: Task | null;
  file: File | null;
  onFileChange: (file: File | null) => void;
  removeExisting: boolean;
  onRemoveExisting: () => void;
}

export default function AttachmentField({
  task,
  file,
  onFileChange,
  removeExisting,
  onRemoveExisting,
}: AttachmentFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const showsSaved = Boolean(task?.attachment) && !removeExisting && !file;
  const { data: savedImage } = useAttachment(task?._id ?? "", showsSaved);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [file]);

  const shownImage = preview ?? (showsSaved ? savedImage : null);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0];
    event.target.value = "";

    if (!selected) return;

    if (!ALLOWED_TYPES.includes(selected.type)) {
      toast.error("Only PNG and JPG images are allowed");
      return;
    }

    if (selected.size > MAX_IMAGE_SIZE) {
      toast.error("Image must be 2MB or smaller");
      return;
    }

    onFileChange(selected);
  }

  function clear() {
    onFileChange(null);
    if (task?.attachment) onRemoveExisting();
  }

  return (
    <div className="space-y-2">
      <Label>Image</Label>

      {shownImage ? (
        <div className="relative">
          <img
            src={shownImage}
            alt="Attachment preview"
            className="max-h-40 w-full rounded-lg border object-contain"
          />
          <Button
            type="button"
            variant="secondary"
            size="icon"
            aria-label="Remove image"
            onClick={clear}
            className="absolute top-2 right-2"
          >
            <X size={16} />
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          className="w-full"
        >
          <ImagePlus size={16} />
          Add image
        </Button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg"
        onChange={handleChange}
        className="hidden"
      />

      <p className="text-xs text-muted-foreground">
        PNG, JPG or JPEG, up to 2 MB.
      </p>
    </div>
  );
}
