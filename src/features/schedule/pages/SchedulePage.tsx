import React, { useState } from 'react';
import { useScheduleStore } from '../store/useScheduleStore';
import { ScheduleGrid } from '../components/ScheduleGrid';
import { CreateAppointmentModal } from '../components/CreateAppointmentModal';
import { AppointmentDetailsDrawer } from '../components/AppointmentDetailsDrawer';
import type { SelectedSlot } from '../types';
import { formatFullDate } from '../utils/time';

export const SchedulePage: React.FC = () => {
  const currentDate = useScheduleStore((state) => state.currentDate);
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Schedule</h1>
        <p className="text-slate-500 text-sm mt-1">
          {formatFullDate(currentDate)}
        </p>
      </div>

      <ScheduleGrid onSelectEmptySlot={setSelectedSlot} />

      <CreateAppointmentModal
        slot={selectedSlot}
        onClose={() => setSelectedSlot(null)}
      />

      <AppointmentDetailsDrawer />
    </div>
  );
};