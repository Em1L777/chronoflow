import React, { useMemo, useRef } from 'react';
import { clsx } from 'clsx';
import { useScheduleStore } from '../store/useScheduleStore';
import { AppointmentCard } from './AppointmentCard';
import { generateTimeSlots, timeToMinutes } from '../utils/time';
import { SCHEDULE_CONFIG, START_DAY_MINUTES } from '../constants';
import type { SelectedSlot } from '../types';

interface ScheduleGridProps {
  onSelectEmptySlot: (slot: SelectedSlot) => void;
}

export const ScheduleGrid: React.FC<ScheduleGridProps> = ({
  onSelectEmptySlot,
}) => {
  const { specialists, appointments, currentDate, timeZone, dragPreview } =
    useScheduleStore();
  const timeSlots = useMemo(() => generateTimeSlots(), []);
  const gridColumnsRef = useRef<HTMLDivElement | null>(null);

  const dayAppointments = useMemo(
    () => appointments.filter((app) => app.date === currentDate),
    [appointments, currentDate]
  );

  const fullRowGridStyle = useMemo(
    () => ({
      gridTemplateColumns: `100px repeat(${specialists.length}, minmax(0, 1fr))`,
    }),
    [specialists.length]
  );

  const specialistsColumnsStyle = useMemo(
    () => ({
      gridTemplateColumns: `repeat(${specialists.length}, minmax(0, 1fr))`,
    }),
    [specialists.length]
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Header Row: Specialists */}
        <div
          style={fullRowGridStyle}
          className="grid border-b border-slate-200"
        >
          <div className="p-4 flex items-end justify-center font-medium text-xs text-slate-400 border-r border-slate-200/80">
            {timeZone}
          </div>

          {specialists.map((spec) => (
            <div
              key={spec.id}
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
                style={{
                  ...fullRowGridStyle,
                  height: `${SCHEDULE_CONFIG.SLOT_HEIGHT_PX}px`,
                }}
                className="grid border-b border-slate-100 last:border-b-0"
              >
                {/* Time Label Column */}
                <div className="pr-3 text-right text-xs text-slate-400 border-r border-slate-200/80 select-none -translate-y-2">
                  {isFullHour ? time : ''}
                </div>

                {/* Interactive Empty Slot Cells */}
                {specialists.map((spec) => (
                  <button
                    key={`${spec.id}-${slotIndex}`}
                    type="button"
                    aria-label={`Book ${spec.name} at ${time}`}
                    onClick={() =>
                      onSelectEmptySlot({
                        specialistId: spec.id,
                        startTime: time,
                      })
                    }
                    className="group relative border-r last:border-r-0 border-slate-100 hover:bg-indigo-50/40 transition-colors cursor-pointer text-left focus:outline-none focus-visible:bg-indigo-50/60"
                  >
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[11px] font-medium text-indigo-600/80 pl-2">
                      + {time}
                    </span>
                  </button>
                ))}
              </div>
            );
          })}

          {/* Absolute Appointment Overlay Columns */}
          <div className="absolute inset-0 pl-[100px] pointer-events-none">
            <div
              ref={gridColumnsRef}
              style={specialistsColumnsStyle}
              className="grid h-full w-full pointer-events-none"
            >
              {specialists.map((spec) => {
                const specAppointments = dayAppointments.filter(
                  (a) => a.specialistId === spec.id
                );

                const showPreviewInColumn =
                  dragPreview !== null && dragPreview.specialistId === spec.id;

                const previewTopPx = showPreviewInColumn
                  ? ((timeToMinutes(dragPreview.startTime) - START_DAY_MINUTES) /
                      SCHEDULE_CONFIG.STEP_MINUTES) *
                    SCHEDULE_CONFIG.SLOT_HEIGHT_PX
                  : 0;

                const previewHeightPx = showPreviewInColumn
                  ? ((timeToMinutes(dragPreview.endTime) -
                      timeToMinutes(dragPreview.startTime)) /
                      SCHEDULE_CONFIG.STEP_MINUTES) *
                    SCHEDULE_CONFIG.SLOT_HEIGHT_PX
                  : 0;

                return (
                  <div key={spec.id} className="relative h-full pointer-events-none">
                    {specAppointments.map((app) => (
                      <AppointmentCard
                        key={app.id}
                        appointment={app}
                        gridColumnsRef={gridColumnsRef}
                      />
                    ))}

                    {/* Drop Target Ghost Preview */}
                    {showPreviewInColumn && (
                      <div
                        style={{
                          top: `${previewTopPx}px`,
                          height: `${previewHeightPx}px`,
                        }}
                        className={clsx(
                          'pointer-events-none absolute left-1 right-1 z-30 rounded-md border-2 border-dashed px-2.5 py-1.5 flex flex-col justify-between transition-all duration-75',
                          dragPreview.isValid
                            ? 'border-indigo-500 bg-indigo-50/85 text-indigo-950 shadow-md'
                            : 'border-rose-500 bg-rose-50/90 text-rose-950 shadow-md'
                        )}
                      >
                        <div className="min-w-0">
                          <span className="text-xs font-medium block leading-none">
                            {dragPreview.startTime} - {dragPreview.endTime}
                          </span>
                          <h4 className="text-sm font-semibold leading-tight mt-0.5 truncate">
                            {dragPreview.serviceName}
                          </h4>
                        </div>
                        {previewHeightPx > SCHEDULE_CONFIG.SLOT_HEIGHT_PX && (
                          <p className="text-xs opacity-75 truncate">
                            {dragPreview.isValid
                              ? dragPreview.clientName
                              : 'Slot occupied'}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};