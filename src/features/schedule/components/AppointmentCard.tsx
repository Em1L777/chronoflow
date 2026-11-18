import React from 'react';
import { clsx } from 'clsx';
import { Check } from 'lucide-react';
import type { Appointment, AppointmentColor } from '../types';
import { timeToMinutes } from '../utils/time';
import { SCHEDULE_CONFIG, START_DAY_MINUTES } from '../constants';
import { useScheduleStore } from '../store/useScheduleStore';
import { useAppointmentResize } from '../hooks/useAppointmentResize';
import { useAppointmentDrag } from '../hooks/useAppointmentDrag';

interface AppointmentCardProps {
  appointment: Appointment;
  gridColumnsRef: React.RefObject<HTMLDivElement | null>;
}

const COLOR_STYLES: Record<AppointmentColor, { bg: string; border: string }> = {
  slate: {
    bg: 'bg-slate-100/90 text-slate-800',
    border: 'border-l-slate-400',
  },
  rose: {
    bg: 'bg-rose-50/90 text-rose-950',
    border: 'border-l-rose-400',
  },
  sky: {
    bg: 'bg-sky-50/90 text-sky-950',
    border: 'border-l-sky-400',
  },
};

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  gridColumnsRef,
}) => {
  const specialists = useScheduleStore((state) => state.specialists);
  const appointments = useScheduleStore((state) => state.appointments);
  const selectedAppointmentId = useScheduleStore(
    (state) => state.selectedAppointmentId
  );
  const setSelectedAppointment = useScheduleStore(
    (state) => state.setSelectedAppointment
  );
  const updateAppointment = useScheduleStore((state) => state.updateAppointment);
  const setDragPreview = useScheduleStore((state) => state.setDragPreview);

  const isSelected = selectedAppointmentId === appointment.id;
  const isCompleted = appointment.status === 'completed';

  const {
    isResizing,
    isInvalidResize,
    displayStartTime,
    displayEndTime,
    getResizeHandleProps,
  } = useAppointmentResize({
    appointment,
    allAppointments: appointments,
    onCommitResize: (id, nextTimes) => updateAppointment(id, nextTimes),
  });

  const { isDragging, dragHandlers } = useAppointmentDrag({
    appointment,
    specialists,
    allAppointments: appointments,
    gridColumnsRef,
    onDragPreviewChange: setDragPreview,
    onCommitDrop: (id, patch) => updateAppointment(id, patch),
    onClick: () => setSelectedAppointment(appointment.id),
  });

  const startMinutes = timeToMinutes(displayStartTime);
  const endMinutes = timeToMinutes(displayEndTime);

  const topOffsetPx =
    ((startMinutes - START_DAY_MINUTES) / SCHEDULE_CONFIG.STEP_MINUTES) *
    SCHEDULE_CONFIG.SLOT_HEIGHT_PX;
  const heightPx =
    ((endMinutes - startMinutes) / SCHEDULE_CONFIG.STEP_MINUTES) *
    SCHEDULE_CONFIG.SLOT_HEIGHT_PX;

  const styleConfig = COLOR_STYLES[appointment.colorVariant] || COLOR_STYLES.slate;
  const isCompact = heightPx <= SCHEDULE_CONFIG.SLOT_HEIGHT_PX;

  return (
    <div
      {...dragHandlers}
      onClick={(e) => e.stopPropagation()}
      style={{
        top: `${topOffsetPx}px`,
        height: `${heightPx}px`,
      }}
      className={clsx(
        'group/card pointer-events-auto absolute left-1 right-1 rounded-md border-l-4 overflow-hidden flex flex-col justify-between select-none touch-none',
        isCompact ? 'px-2.5 py-1' : 'p-2.5',
        styleConfig.bg,
        styleConfig.border,
        isCompleted && 'opacity-70',
        isSelected && !isDragging && !isResizing && 'ring-2 ring-indigo-500/60',
        isDragging && 'opacity-40 cursor-grabbing z-10',
        isResizing && 'z-20 shadow-lg ring-2 transition-none',
        !isDragging &&
          !isResizing &&
          'z-10 transition-shadow hover:shadow-md cursor-pointer',
        isResizing &&
          (isInvalidResize
            ? 'ring-rose-500/80 bg-rose-100/95'
            : 'ring-indigo-500/40')
      )}
    >
      {/* Top Resize Handle */}
      <div
        {...getResizeHandleProps('top')}
        aria-label="Resize appointment start time"
        className="absolute inset-x-0 top-0 h-2 cursor-ns-resize flex items-start justify-center pt-0.5 z-20"
      >
        <span className="w-7 h-0.5 rounded-full bg-slate-900/20 opacity-0 group-hover/card:opacity-100 transition-opacity" />
      </div>

      {/* Card Content */}
      <div className="min-w-0 pointer-events-none">
        <div className="flex items-center justify-between gap-1">
          <span
            className={clsx(
              'text-xs font-normal opacity-80 block tracking-tight leading-none truncate',
              isCompleted && 'line-through'
            )}
          >
            {displayStartTime} - {displayEndTime}
          </span>
          {isCompleted && (
            <span
              title="Completed"
              className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-emerald-600/15 text-emerald-700 shrink-0"
            >
              <Check className="w-2.5 h-2.5 stroke-[2.5]" />
            </span>
          )}
        </div>
        <h4
          className={clsx(
            'text-sm font-semibold leading-tight mt-0.5 truncate',
            isCompleted && 'line-through opacity-80'
          )}
        >
          {appointment.serviceName}
        </h4>
      </div>

      {!isCompact && (
        <p
          className={clsx(
            'text-xs opacity-75 truncate pointer-events-none',
            isCompleted && 'line-through'
          )}
        >
          {appointment.clientName}
        </p>
      )}

      {/* Bottom Resize Handle */}
      <div
        {...getResizeHandleProps('bottom')}
        aria-label="Resize appointment end time"
        className="absolute inset-x-0 bottom-0 h-2 cursor-ns-resize flex items-end justify-center pb-0.5 z-20"
      >
        <span className="w-7 h-0.5 rounded-full bg-slate-900/20 opacity-0 group-hover/card:opacity-100 transition-opacity" />
      </div>
    </div>
  );
};