import { SendIcon } from "lucide-react";
import { Input } from "@/components/ui/input";

export const Composer = () => {
  return (
    <div className="composer bg-card rounded-2xl p-3 shadow-md">
      <form className="composerForm flex items-center gap-2">
        <Input type="text" placeholder="Type a message" />
        <button
          type="submit"
          className="bg-brand text-brand-foreground flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors hover:opacity-90"
        >
          <SendIcon size={16} strokeWidth={2} />
        </button>
      </form>
    </div>
  );
};
