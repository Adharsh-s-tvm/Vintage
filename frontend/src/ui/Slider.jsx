import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "../lib/util"

const Slider = React.forwardRef(({ className, onValueCommit, onValueChange, ...props }, ref) => (
    <SliderPrimitive.Root
        ref={ref}
        onValueChange={onValueChange}
        className={cn(
            "relative flex w-full touch-none select-none items-center",
            className
        )}
        {...props}
    >
        <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
            <SliderPrimitive.Range className="absolute h-full bg-primary transition-colors duration-200 ease-in-out" />
        </SliderPrimitive.Track>
        {[0, 1].map((index) => (
            <SliderPrimitive.Thumb
                key={index}
                className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors duration-200 hover:scale-110 hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            />
        ))}
    </SliderPrimitive.Root>
));

Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
