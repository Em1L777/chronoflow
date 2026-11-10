import React from 'react';
import { clsx } from 'clsx';
import type { Appointment, AppointmentColor } from '../types';
import { timeToMinutes } from '../utils/time';

interface AppointmentCardProps {
  appointment: Appointment;
  slotHeightPx: number;
  startDayMinutes: number;
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
  slotHeightPx,
  startDayMinutes,
}) => {
  const startMinutes = timeToMinutes(appointment.startTime);
  const endMinutes = timeToMinutes(appointment.endTime);

  const topOffsetPx = ((startMinutes - startDayMinutes) / 30) * slotHeightPx;
  const heightPx = ((endMinutes - startMinutes) / 30) * slotHeightPx;

  const styleConfig = COLOR_STYLES[appointment.colorVariant] || COLOR_STYLES.slate;

  return (
    <div
      style={{
        top: `${topOffsetPx}px`,
        height: `${heightPx}px`,
      }}
      className={clsx(
        'absolute left-1 right-1 rounded-md p-2.5 border-l-4 transition-shadow hover:shadow-md cursor-pointer overflow-hidden flex flex-col justify-between',
        styleConfig.bg,
        styleConfig.border
      )}
    >
      <div>
        <span className="text-xs font-normal opacity-80 block tracking-tight">
          {appointment.startTime} - {appointment.endTime}
        </span>
        <h4 className="text-sm font-semibold leading-tight mt-0.5">
          {appointment.serviceName}
        </h4>
      </div>
      <p className="text-xs opacity-75">{appointment.clientName}</p>
    </div>
  );
};