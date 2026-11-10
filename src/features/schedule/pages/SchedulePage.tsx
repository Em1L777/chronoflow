import React from 'react';
import { useScheduleStore } from '../store/useScheduleStore';
import { ScheduleGrid } from '../components/ScheduleGrid';

export const SchedulePage: React.FC = () => {
  const currentDate = useScheduleStore((state) => state.currentDate);

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Schedule</h1>
        <p className="text-slate-500 text-sm mt-1">{currentDate}</p>
      </div>

      <ScheduleGrid />
    </div>
  );
};