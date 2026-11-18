import React, { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import { useScheduleStore } from '../store/useScheduleStore';
import type { AppointmentColor, SelectedSlot } from '../types';
import {
  formatFullDate,
  generateTimeOptions,
  hasAppointmentOverlap,
  minutesToTime,
  timeToMinutes,
} from '../utils/time';
import { SCHEDULE_CONFIG } from '../constants';

interface CreateAppointmentModalProps {
  slot: SelectedSlot | null;
  onClose: () => void;
}

const COLOR_OPTIONS: { value: AppointmentColor; label: string; dotClass: string }[] = [
  { value: 'slate', label: 'Neutral', dotClass: 'bg-slate-400' },
  { value: 'rose', label: 'Rose', dotClass: 'bg-rose-400' },
  { value: 'sky', label: 'Sky', dotClass: 'bg-sky-400' },
];

export const CreateAppointmentModal: React.FC<CreateAppointmentModalProps> = ({
  slot,
  onClose,
}) => {
  const { specialists, appointments, currentDate, addAppointment } =
    useScheduleStore();

  const specialist = useMemo(
    () => specialists.find((s) => s.id === slot?.specialistId) ?? null,
    [specialists, slot?.specialistId]
  );

  const startOptions = useMemo(() => generateTimeOptions(false), []);
  const endOptions = useMemo(() => generateTimeOptions(true), []);

  const [clientName, setClientName] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('09:30');
  const [colorVariant, setColorVariant] = useState<AppointmentColor>('slate');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slot) return;

    const initialStartMinutes = timeToMinutes(slot.startTime);
    const defaultEndTime = minutesToTime(
      initialStartMinutes + SCHEDULE_CONFIG.STEP_MINUTES
    );

    setClientName('');
    setServiceName('');
    setStartTime(slot.startTime);
    setEndTime(defaultEndTime);
    setColorVariant('slate');
    setError(null);
  }, [slot]);

  useEffect(() => {
    if (!slot) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slot, onClose]);

  if (!slot || !specialist) return null;

  const handleStartTimeChange = (nextStart: string) => {
    setStartTime(nextStart);
    setError(null);

    const nextStartMin = timeToMinutes(nextStart);
    const currentEndMin = timeToMinutes(endTime);

    if (currentEndMin <= nextStartMin) {
      setEndTime(minutesToTime(nextStartMin + SCHEDULE_CONFIG.STEP_MINUTES));
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const trimmedClient = clientName.trim();
    const trimmedService = serviceName.trim();

    if (!trimmedClient || !trimmedService) {
      setError('Пожалуйста, укажите имя клиента и название услуги.');
      return;
    }

    const startMin = timeToMinutes(startTime);
    const endMin = timeToMinutes(endTime);

    if (endMin <= startMin) {
      setError('Время окончания должно быть позже времени начала.');
      return;
    }

    const overlaps = hasAppointmentOverlap(
      appointments,
      specialist.id,
      currentDate,
      startTime,
      endTime
    );

    if (overlaps) {
      setError('Выбранный интервал пересекается с существующей записью специалиста.');
      return;
    }

    addAppointment({
      specialistId: specialist.id,
      date: currentDate,
      clientName: trimmedClient,
      serviceName: trimmedService,
      startTime,
      endTime,
      colorVariant,
      status: 'scheduled',
      notes: '',
    });

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/25 backdrop-blur-[1px] p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-appointment-title"
    >
      <div
        className="w-full max-w-md rounded-xl bg-white border border-slate-200 shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h2
              id="create-appointment-title"
              className="text-base font-semibold text-slate-900"
            >
              New Appointment
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {formatFullDate(currentDate)}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Specialist Context Pill */}
        <div className="px-5 pt-4">
          <div className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200/70">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-medium text-xs flex items-center justify-center shrink-0">
              {specialist.avatarInitials}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-slate-800 truncate">
                {specialist.name}
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                {specialist.role}
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label
              htmlFor="client-name"
              className="block text-xs font-medium text-slate-700 mb-1"
            >
              Client Name
            </label>
            <input
              id="client-name"
              type="text"
              autoFocus
              placeholder="e.g. J. Morgan"
              value={clientName}
              onChange={(e) => {
                setClientName(e.target.value);
                setError(null);
              }}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/15"
            />
          </div>

          <div>
            <label
              htmlFor="service-name"
              className="block text-xs font-medium text-slate-700 mb-1"
            >
              Service
            </label>
            <input
              id="service-name"
              type="text"
              placeholder="e.g. Haircut & style"
              value={serviceName}
              onChange={(e) => {
                setServiceName(e.target.value);
                setError(null);
              }}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/15"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="start-time"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Start Time
              </label>
              <select
                id="start-time"
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
              <label
                htmlFor="end-time"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                End Time
              </label>
              <select
                id="end-time"
                value={endTime}
                onChange={(e) => {
                  setEndTime(e.target.value);
                  setError(null);
                }}
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

          {/* Color Tag */}
          <div>
            <span className="block text-xs font-medium text-slate-700 mb-1.5">
              Card Accent
            </span>
            <div className="flex items-center gap-2">
              {COLOR_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setColorVariant(option.value)}
                  className={clsx(
                    'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-xs font-medium transition-colors',
                    colorVariant === option.value
                      ? 'border-indigo-500 bg-indigo-50/60 text-indigo-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  )}
                >
                  <span className={clsx('w-2 h-2 rounded-full', option.dotClass)} />
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200/80 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-xs"
            >
              Create Appointment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};