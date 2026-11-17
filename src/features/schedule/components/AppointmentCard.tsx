import React from 'react';
import { clsx } from 'clsx';
import type { Appointment, AppointmentColor } from '../types';
import { timeToMinutes } from '../utils/time';
import { SCHEDULE_CONFIG, START_DAY_MINUTES } from '../constants';

interface AppointmentCardProps {
  appointment: Appointment;
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
}) => {
  const startMinutes = timeToMinutes(appointment.startTime);
  const endMinutes = timeToMinutes(appointment.endTime);

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
      onClick={(e) => e.stopPropagation()}
      style={{
        top: `${topOffsetPx}px`,
        height: `${heightPx}px`,
      }}
      className={clsx(
        'pointer-events-auto absolute left-1 right-1 rounded-md border-l-4 transition-shadow hover:shadow-md cursor-pointer overflow-hidden flex flex-col justify-between select-none',
        isCompact ? 'px-2.5 py-1' : 'p-2.5',
        styleConfig.bg,
        styleConfig.border
      )}
    >
      <div className="min-w-0">
        <span className="text-xs font-normal opacity-80 block tracking-tight leading-none">
          {appointment.startTime} - {appointment.endTime}
        </span>
        <h4 className="text-sm font-semibold leading-tight mt-0.5 truncate">
          {appointment.serviceName}
        </h4>
      </div>
      {!isCompact && (
        <p className="text-xs opacity-75 truncate">{appointment.clientName}</p>
      )}
    </div>
  );
};