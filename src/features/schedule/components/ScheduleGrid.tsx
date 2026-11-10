import React from 'react';
import { useScheduleStore } from '../store/useScheduleStore';
import { AppointmentCard } from './AppointmentCard';
import { generateTimeSlots, timeToMinutes } from '../utils/time';

const SLOT_HEIGHT_PX = 36; // Высота получасового слота в пикселях
const START_HOUR = 9;
const END_HOUR = 18;
const START_DAY_MINUTES = START_HOUR * 60;

export const ScheduleGrid: React.FC = () => {
  const { specialists, appointments, timeZone } = useScheduleStore();
  const timeSlots = generateTimeSlots(START_HOUR, END_HOUR, 30);

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Header Row: Specialists */}
        <div className="grid grid-cols-[100px_repeat(5,1fr)] border-b border-slate-200">
          <div className="p-4 flex items-end justify-center font-medium text-xs text-slate-400 border-r border-slate-200/80">
            {timeZone}
          </div>

          {specialists.map((spec, index) => (
            <div
              key={`${spec.id}-${index}`}
              className="p-3 border-r last:border-r-0 border-slate-200/80 flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-medium text-xs flex items-center justify-center shrink-0">
                {spec.avatarInitials}
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-xs text-slate-800 truncate">
                  {spec.name}
                </div>
                <div className="text-[11px] text-slate-400 truncate leading-none mt-0.5">
                  {spec.role}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Time Grid Rows */}
        <div className="relative">
          {timeSlots.map((time, slotIndex) => {
            const isFullHour = time.endsWith(':00');

            return (
              <div
                key={time}
                style={{ height: `${SLOT_HEIGHT_PX}px` }}
                className="grid grid-cols-[100px_repeat(5,1fr)] border-b border-slate-100 last:border-b-0"
              >
                {/* Time Label Column */}
                <div className="pr-3 text-right text-xs text-slate-400 border-r border-slate-200/80 select-none -translate-y-2">
                  {isFullHour ? time : ''}
                </div>

                {/* Grid Cells */}
                {specialists.map((spec, specIndex) => (
                  <div
                    key={`${spec.id}-${slotIndex}`}
                    className="border-r last:border-r-0 border-slate-100 hover:bg-slate-50/50 transition-colors"
                  />
                ))}
              </div>
            );
          })}

          {/* Absolute Appointment Overlay Columns */}
          <div className="absolute inset-0 pl-[100px] grid grid-cols-5 pointer-events-none">
            {specialists.map((spec) => {
              const specAppointments = appointments.filter(
                (a) => a.specialistId === spec.id
              );

              return (
                <div key={spec.id} className="relative h-full pointer-events-auto">
                  {specAppointments.map((app) => (
                    <AppointmentCard
                      key={app.id}
                      appointment={app}
                      slotHeightPx={SLOT_HEIGHT_PX}
                      startDayMinutes={START_DAY_MINUTES}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};