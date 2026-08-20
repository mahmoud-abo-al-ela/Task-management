import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";

const PasswordInput = forwardRef<
  HTMLInputElement,
  React.ComponentProps<typeof Input>
>((props, ref) => {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <Input
        ref={ref}
        type={show ? "text" : "password"}
        className="pr-10"
        {...props}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        aria-label={show ? "Hide password" : "Show password"}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
});

export default PasswordInput;
