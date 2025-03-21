import React from 'react';

export function Loader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-row gap-2">
        <div className="w-4 h-4 rounded-full bg-primary animate-bounce [animation-delay:.7s]"></div>
        <div className="w-4 h-4 rounded-full bg-primary animate-bounce [animation-delay:.3s]"></div>
        <div className="w-4 h-4 rounded-full bg-primary animate-bounce [animation-delay:.7s]"></div>
      </div>
    </div>
  );
}