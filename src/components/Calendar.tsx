import * as React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

interface CalendarProps {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
}

export function Calendar({ date, onDateChange }: CalendarProps) {
  return (
    <PopoverPrimitive.Root>
      <PopoverPrimitive.Trigger asChild>
        <button className="relative w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40 text-left">
          <div className="flex items-center">
            <CalendarIcon className="h-5 w-5 text-gray-400 absolute left-3" />
            <span className="pl-10">
              {date ? format(date, 'PPP') : 'Select a date'}
            </span>
          </div>
        </button>
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          className="bg-gray-900/95 backdrop-blur-md border border-white/20 rounded-lg p-4 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="p-4">
            <input
              type="date"
              value={date ? format(date, 'yyyy-MM-dd') : ''}
              onChange={(e) => onDateChange(e.target.value ? new Date(e.target.value) : undefined)}
              className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40"
            />
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}