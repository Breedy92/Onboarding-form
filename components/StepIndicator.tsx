
import React from 'react';
import { Step, StepKey } from '../types';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
  steps: Step[];
  currentStepIndex: number;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ steps, currentStepIndex }) => {
  return (
    <div className="flex items-center justify-between w-full max-w-2xl mx-auto mb-12">
      {steps.map((step, index) => {
        const isCompleted = index < currentStepIndex;
        const isActive = index === currentStepIndex;

        return (
          <React.Fragment key={step.key}>
            <div className="flex flex-col items-center gap-2 relative">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10
                  ${isCompleted ? 'bg-indigo-600 border-indigo-600 text-white' : 
                    isActive ? 'bg-white border-indigo-600 text-indigo-600' : 'bg-white border-slate-200 text-slate-400'}`}
              >
                {isCompleted ? <Check size={20} /> : <span className="font-semibold">{index + 1}</span>}
              </div>
              <span className={`text-[11px] uppercase tracking-wider font-bold absolute -bottom-6 whitespace-nowrap
                ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}>
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className="flex-1 h-0.5 bg-slate-100 mx-2 relative -top-3">
                <div 
                  className="h-full bg-indigo-600 transition-all duration-500" 
                  style={{ width: isCompleted ? '100%' : '0%' }}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
