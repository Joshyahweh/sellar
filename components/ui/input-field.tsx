import type { ComponentProps, ReactNode } from "react";
import { AtIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

type InputFieldProps = ComponentProps<"input"> & {
  label: string;
  icon?: ReactNode;
};

export function InputField({
  label,
  id,
  className,
  icon,
  ...props
}: InputFieldProps) {
  const fieldId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <label className="flex h-[88px] w-full flex-col items-start gap-[8px]" htmlFor={fieldId}>
      <span className="font-medium text-[16px] leading-[normal] text-[#14181b]">
        {label}
      </span>
      <span className="relative block w-full">
        <input
          id={fieldId}
          className={cn(
            "h-[56px] w-full rounded-[8px] border border-solid border-[#e4e8eb] bg-white px-[16px] font-normal text-[16px] leading-[normal] text-[#14181b] outline-none placeholder:text-[#a5a5a5]",
            icon ? "pr-[44px]" : null,
            className,
          )}
          {...props}
        />
        {icon ? (
          <span className="pointer-events-none absolute top-1/2 right-[16px] -translate-y-1/2 text-[#a5a5a5]">
            {icon}
          </span>
        ) : null}
      </span>
    </label>
  );
}

type IconFieldProps = ComponentProps<"input"> & {
  label: string;
  icon?: ReactNode;
};

export function IconInputField({
  label,
  id,
  className,
  icon,
  ...props
}: IconFieldProps) {
  const fieldId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <label className="flex w-full flex-col items-start gap-[8px]" htmlFor={fieldId}>
      <span className="font-medium text-[14px] leading-[normal] text-[#14181b]">
        {label}
      </span>
      <span className="relative block w-full">
        <input
          id={fieldId}
          className={cn(
            "h-[48px] w-full rounded-[8px] border border-solid border-[#e4e8eb] bg-white px-[16px] pr-[40px] font-normal text-[14px] leading-[normal] text-[#14181b] outline-none placeholder:text-[#a5a5a5]",
            className,
          )}
          {...props}
        />
        <span className="pointer-events-none absolute top-1/2 right-[12px] -translate-y-1/2 text-[#a5a5a5]">
          {icon ?? <AtIcon size={18} />}
        </span>
      </span>
    </label>
  );
}

type TextAreaFieldProps = ComponentProps<"textarea"> & {
  label: string;
  icon?: ReactNode;
};

export function TextAreaField({
  label,
  id,
  className,
  icon,
  ...props
}: TextAreaFieldProps) {
  const fieldId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <label className="flex h-[163px] w-full flex-col items-start gap-[8px]" htmlFor={fieldId}>
      <span className="font-medium text-[16px] leading-[normal] text-[#14181b]">
        {label}
      </span>
      <span className="relative block w-full">
        <textarea
          id={fieldId}
          className={cn(
            "h-[131px] w-full resize-none rounded-[8px] border border-solid border-[#e4e8eb] bg-white px-[16px] py-[16px] font-normal text-[16px] leading-[normal] text-[#14181b] outline-none placeholder:text-[#a5a5a5]",
            icon ? "pr-[44px]" : null,
            className,
          )}
          {...props}
        />
        {icon ? (
          <span className="pointer-events-none absolute top-[16px] right-[16px] text-[#a5a5a5]">
            {icon}
          </span>
        ) : null}
      </span>
    </label>
  );
}
