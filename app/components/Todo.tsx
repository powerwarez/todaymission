import React from 'react';
import { CheckCircle } from 'lucide-react';
import { cn, playConfetti } from '../lib/utils';
import type { Mission } from '../lib/supabase';

interface TodoProps {
  mission: Mission;
  onComplete: (id: number, completed: boolean) => Promise<void>;
}

export function Todo({ mission, onComplete }: TodoProps) {
  const handleToggle = async () => {
    if (!mission.completed) {
      playConfetti();
    }
    await onComplete(mission.id, !mission.completed);
  };

  return (
    <div 
      className={cn(
        "flex items-center p-4 rounded-2xl transition-all duration-300 mb-3",
        mission.completed 
          ? "bg-primary-100 border-2 border-primary-300" 
          : "bg-white border-2 border-gray-100 hover:border-primary-200"
      )}
    >
      <div className="flex-1">
        <h3 className={cn(
          "text-lg font-semibold",
          mission.completed ? "text-primary-700 line-through" : "text-gray-800"
        )}>
          {mission.title}
        </h3>
      </div>
      
      <button
        onClick={handleToggle}
        className={cn(
          "ml-4 p-2 rounded-full transition-colors",
          mission.completed 
            ? "text-primary-500 bg-primary-100 hover:bg-primary-200" 
            : "text-gray-400 bg-gray-100 hover:bg-gray-200 hover:text-gray-600"
        )}
      >
        <CheckCircle className={cn(
          "h-6 w-6",
          mission.completed ? "fill-primary-200 stroke-primary-500" : ""
        )} />
      </button>
    </div>
  );
}
