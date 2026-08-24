"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { Check, Copy } from "lucide-react";
import {
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-medium transition-colors duration-200 disabled:opacity-40 disabled:pointer-events-none select-none whitespace-nowrap",
  {
    variants: {
      variant: {
        primary: "bg-accent text-accent-fg hover:bg-fg active:scale-[0.98]",
        ghost:
          "bg-transparent text-fg border border-border hover:border-border-strong hover:bg-surface-2",
        quiet: "bg-transparent text-muted hover:text-fg hover:bg-surface-2",
        signal: "bg-signal text-fg hover:opacity-90 active:scale-[0.98]",
        danger: "border border-fail/40 text-fail hover:bg-fail/10",
      },
      size: {
        sm: "h-8 px-3 text-xs rounded-sm",
        md: "h-10 px-4 text-sm rounded-md",
        lg: "h-12 px-5 text-sm rounded-md",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export function Button({
  className,
  variant,
  size,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export function FieldLabel({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 mb-1.5">
      <label className="text-[11px] tracking-[0.16em] uppercase text-subtle font-medium">
        {children}
      </label>
      {hint ? <span className="text-[11px] text-subtle">{hint}</span> : null}
    </div>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "h-10 w-full rounded-md border border-border bg-bg-elevated px-3 text-sm text-fg placeholder:text-subtle outline-none focus:border-border-strong",
        props.className,
      )}
    />
  );
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full rounded-lg border border-border bg-bg-elevated px-3 py-2.5 text-sm leading-relaxed text-fg placeholder:text-subtle outline-none focus:border-border-strong resize-y min-h-28",
        props.className,
      )}
    />
  );
}

export function Select({
  value,
  onChange,
  options,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "h-10 w-full rounded-md border border-border bg-bg-elevated px-3 text-sm text-fg outline-none focus:border-border-strong",
        className,
      )}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function Chip({
  active,
  children,
  onClick,
}: {
  active?: boolean;
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-8 px-3 rounded-full text-xs border transition-colors",
        active
          ? "bg-accent text-accent-fg border-accent"
          : "border-border text-muted hover:text-fg hover:border-border-strong",
      )}
    >
      {children}
    </button>
  );
}

export function Badge({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "pass" | "warn" | "fail" | "signal";
  children: ReactNode;
}) {
  const map = {
    neutral: "border-border text-muted",
    pass: "border-pass/40 text-pass",
    warn: "border-warn/40 text-warn",
    fail: "border-fail/40 text-fail",
    signal: "border-signal/40 text-signal",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center h-6 px-2 rounded-full text-[10px] tracking-[0.12em] uppercase border",
        map[tone],
      )}
    >
      {children}
    </span>
  );
}

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <section
      className={cn(
        "rounded-xl border border-border bg-surface p-5 shadow-panel",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          window.setTimeout(() => setDone(false), 1400);
        } catch {
          /* ignore */
        }
      }}
    >
      {done ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      {done ? "Copied" : label}
    </Button>
  );
}
