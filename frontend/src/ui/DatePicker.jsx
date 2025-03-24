import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "../lib/util"
import { Button } from "./Button"
import { Calendar } from "./Calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./Popover"

export function DatePicker({
  selected,
  onChange,
  className,
  placeholderText = "Pick a date"
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[200px] justify-start text-left font-normal",
            !selected && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selected ? format(selected, "PPP") : placeholderText}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={onChange}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
} 