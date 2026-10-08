"use client";

import { format } from "date-fns";
import { CalendarIcon, ChevronDownIcon } from "lucide-react";
import { useState } from "react";
import type { DateRange as DayRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { DateRange } from "@/lib/admin/range";
import { cn } from "@/lib/utils";

export function AdminDatePicker({
  value,
  onChange,
  disabled,
  placeholder = "Pick a date",
  className,
}: {
  value: string | null;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const date = dateFromValue(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            disabled={disabled}
            data-empty={!date}
            className={cn(
              "h-10 justify-between rounded-lg border-[#e4e8eb] bg-white px-3 text-left text-[14px] font-normal text-[#14181b] data-[empty=true]:text-muted-foreground",
              className,
            )}
          />
        }
      >
        {date ? format(date, "PPP") : <span>{placeholder}</span>}
        <ChevronDownIcon data-icon="inline-end" />
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          defaultMonth={date}
          onSelect={(next) => {
            if (!next) return;
            onChange(dateValue(next));
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

export function AdminDateRangePicker({
  value,
  onChange,
  className,
  placeholder = "Pick a date range",
}: {
  value: DateRange;
  onChange: (value: DateRange) => void;
  className?: string;
  placeholder?: string;
}) {
  const from = dateFromValue(value.from);
  const to = dateFromValue(value.to);
  const selected: DayRange | undefined = from ? { from, to } : undefined;

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            data-empty={!from}
            className={cn(
              "h-10 justify-start gap-2 rounded-lg border-[#e4e8eb] bg-white px-2.5 text-left text-[14px] font-normal text-[#14181b] data-[empty=true]:text-muted-foreground",
              className,
            )}
          />
        }
      >
        <CalendarIcon className="size-4" data-icon="inline-start" />
        {from ? (
          to ? (
            <>
              {format(from, "LLL dd, y")} - {format(to, "LLL dd, y")}
            </>
          ) : (
            format(from, "LLL dd, y")
          )
        ) : (
          <span>{placeholder}</span>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          defaultMonth={from}
          selected={selected}
          numberOfMonths={2}
          onSelect={(next) => {
            onChange({
              from: next?.from ? dateValue(next.from) : null,
              to: next?.to ? dateValue(next.to) : null,
            });
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

function dateFromValue(value: string | null) {
  if (!value) return undefined;
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  if (!year || !month || !day) return undefined;
  return new Date(year, month - 1, day);
}

function dateValue(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}
