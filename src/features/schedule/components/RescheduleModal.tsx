import React, { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { useScheduleStore } from '../store/useScheduleStore';
import type { Appointment } from '../types';
import {
  formatDuration,
  generateTimeOptions,
  hasAppointmentOverlap,
  minutesToTime,
  timeToMinutes,
} from '../utils/time';
import { END_DAY_MINUTES, SCHEDULE_CONFIG } from '../constants';

interface RescheduleModalProps {
  appointment: Appointment;
  onClose: () => void;
}

export const RescheduleModal: React.FC<RescheduleModalProps> = ({
  appointment,
  onClose,
}) => {
  const specialists = useScheduleStore((state) => state.specialists);
  const appointments = useScheduleStore((state) => state.appointments);
  const updateAppointment = useScheduleStore((state) => state.updateAppointment);

  const startOptions = useMemo(() => generateTimeOptions(false), []);
  const endOptions = useMemo(() => generateTimeOptions(true), []);

  const initialDuration = useMemo(
    () =>
      Math.max(
        SCHEDULE_CONFIG.MIN_DURATION_MINUTES,
        timeToMinutes(appointment.endTime) - timeToMinutes(appointment.startTime)
      ),
    [appointment.endTime, appointment.startTime]
  );

  const [date, setDate] = useState(appointment.date);
  const [specialistId, setSpecialistId] = useState(appointment.specialistId);
  const [startTime, setStartTime] = useState(appointment.startTime);
  const [endTime, setEndTime] = useState(appointment.endTime);
  const [durationMinutes, setDurationMinutes] = useState(initialDuration);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleStartTimeChange = (nextStart: string) => {
    setStartTime(nextStart);
    setError(null);

    const nextStartMin = timeToMinutes(nextStart);
    const maxAllowedEnd = END_DAY_MINUTES;
    const minAllowedEnd = nextStartMin + SCHEDULE_CONFIG.MIN_DURATION_MINUTES;

    const targetEndMin = Math.min(
      maxAllowedEnd,
      Math.max(minAllowedEnd, nextStartMin + durationMinutes)
    );

    const nextEnd = minutesToTime(targetEndMin);
    setEndTime(nextEnd);
    setDurationMinutes(targetEndMin - nextStartMin);
  };

  const handleEndTimeChange = (nextEnd: string) => {
    setEndTime(nextEnd);
    setError(null);

    const startMin = timeToMinutes(startTime);
    const endMin = timeToMinutes(nextEnd);
    if (endMin > startMin) {
      setDurationMinutes(endMin - startMin);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!date) {
      setError('Please select a valid date.');
      return;
    }

    const startMin = timeToMinutes(startTime);
    const endMin = timeToMinutes(endTime);

    if (endMin <= startMin) {
      setError('End time must be later than start time.');
      return;
    }

    const overlaps = hasAppointmentOverlap(
      appointments,
      specialistId,
      date,
      startTime,
      endTime,
      appointment.id
    );

    if (overlaps) {
      setError(
        'This time slot is already occupied for the selected specialist.'
      );
      return;
    }

    updateAppointment(appointment.id, {
      date,
      specialistId,
      startTime,
      endTime,
    });

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/30 backdrop-blur-[1px] p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="reschedule-modal-title"
    >
      <div
        className="w-full max-w-md rounded-xl bg-white border border-slate-200 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h3
              id="reschedule-modal-title"
              className="text-base font-semibold text-slate-900"
            >
              Reschedule Appointment
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 truncate">
              {appointment.serviceName} · {appointment.clientName}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close reschedule modal"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Specialist Select */}
          <div>
            <label
              htmlFor="reschedule-specialist"
              className="block text-xs font-medium text-slate-700 mb-1"
            >
              Specialist
            </label>
            <select
              id="reschedule-specialist"
              value={specialistId}
              onChange={(e) => {
                setSpecialistId(e.target.value);
                setError(null);
              }}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/15"
            >
              {specialists.map((spec) => (
                <option key={spec.id} value={spec.id}>
                  {spec.name} ({spec.role})
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <div>
            <label
              htmlFor="reschedule-date"
              className="block text-xs font-medium text-slate-700 mb-1"
            >
              Date
            </label>
            <input
              id="reschedule-date"
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setError(null);
              }}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/15"
            />
          </div>

          {/* Start & End Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="reschedule-start-time"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Start Time
              </label>
              <select
                id="reschedule-start-time"
                value={startTime}
                onChange={(e) => handleStartTimeChange(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/15"
              >
                {startOptions.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="reschedule-end-time"
                  className="block text-xs font-medium text-slate-700"
                >
                  End Time
                </label>
                <span className="text-[11px] font-medium text-slate-400">
                  {formatDuration(startTime, endTime)}
                </span>
              </div>
              <select
                id="reschedule-end-time"
                value={endTime}
                onChange={(e) => handleEndTimeChange(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/15"
              >
                {endOptions
                  .filter((time) => timeToMinutes(time) > timeToMinutes(startTime))
                  .map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {error && (
            <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200/80 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-xs cursor-pointer"
            >
              Confirm Reschedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};