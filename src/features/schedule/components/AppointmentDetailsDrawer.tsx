import React, { useEffect, useMemo, useState } from 'react';
import { Check, X } from 'lucide-react';
import { clsx } from 'clsx';
import { useScheduleStore } from '../store/useScheduleStore';
import {
  formatDuration,
  formatShortDate,
  getInitials,
} from '../utils/time';
import { RescheduleModal } from './RescheduleModal';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';

export const AppointmentDetailsDrawer: React.FC = () => {
  const appointments = useScheduleStore((state) => state.appointments);
  const specialists = useScheduleStore((state) => state.specialists);
  const selectedAppointmentId = useScheduleStore(
    (state) => state.selectedAppointmentId
  );
  const setSelectedAppointment = useScheduleStore(
    (state) => state.setSelectedAppointment
  );
  const completeAppointment = useScheduleStore(
    (state) => state.completeAppointment
  );
  const updateAppointment = useScheduleStore((state) => state.updateAppointment);
  const deleteAppointment = useScheduleStore((state) => state.deleteAppointment);

  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const appointment = useMemo(
    () => appointments.find((a) => a.id === selectedAppointmentId) ?? null,
    [appointments, selectedAppointmentId]
  );

  const specialist = useMemo(
    () =>
      appointment
        ? specialists.find((s) => s.id === appointment.specialistId) ?? null
        : null,
    [specialists, appointment]
  );

  const hasSubModalOpen = isRescheduleOpen || isDeleteConfirmOpen;

  useEffect(() => {
    if (!appointment || hasSubModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedAppointment(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [appointment, hasSubModalOpen, setSelectedAppointment]);

  if (!appointment) return null;

  const isCompleted = appointment.status === 'completed';
  const durationLabel = formatDuration(
    appointment.startTime,
    appointment.endTime
  );
  const shortDateLabel = formatShortDate(appointment.date);

  const handleCloseDrawer = () => {
    setIsRescheduleOpen(false);
    setIsDeleteConfirmOpen(false);
    setSelectedAppointment(null);
  };

  const handleConfirmDelete = () => {
    setIsDeleteConfirmOpen(false);
    deleteAppointment(appointment.id);
  };

  return (
    <>
      {/* Subtle Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-slate-900/10 transition-opacity"
        onClick={handleCloseDrawer}
        aria-hidden="true"
      />

      {/* Slide-over Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="appointment-details-title"
        className="fixed inset-y-0 right-0 z-50 w-full max-w-[380px] bg-white border-l border-slate-200/90 shadow-2xl flex flex-col justify-between"
      >
        {/* Top & Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Status Badge & Close */}
          <div className="flex items-center justify-between">
            <span
              className={clsx(
                'inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium',
                isCompleted
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-sky-50 text-sky-600'
              )}
            >
              <span
                className={clsx(
                  'w-2 h-2 rounded-full',
                  isCompleted ? 'bg-emerald-500' : 'bg-sky-400'
                )}
              />
              {isCompleted ? 'Completed' : 'Scheduled'}
            </span>

            <button
              type="button"
              onClick={handleCloseDrawer}
              aria-label="Close appointment details"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Title & Date/Time Subtitle */}
          <div className="mt-4">
            <h2
              id="appointment-details-title"
              className={clsx(
                'text-xl font-semibold tracking-tight text-slate-900',
                isCompleted && 'line-through text-slate-500'
              )}
            >
              {appointment.serviceName}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {shortDateLabel} &nbsp;{appointment.startTime} -{' '}
              {appointment.endTime}
            </p>
          </div>

          {/* Client Card */}
          <div className="mt-5 flex items-center gap-3.5 p-3.5 rounded-xl border border-slate-200/80 bg-white">
            <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 font-medium text-xs flex items-center justify-center shrink-0">
              {getInitials(appointment.clientName)}
            </div>
            <div className="min-w-0">
              <div className="text-xs text-slate-400 leading-none">Client</div>
              <div className="text-sm font-semibold text-slate-900 mt-1 truncate">
                {appointment.clientName}
              </div>
            </div>
          </div>

          {/* Details Key-Value List */}
          <dl className="mt-6 divide-y divide-slate-100 text-sm">
            <div className="py-3 grid grid-cols-[110px_1fr] items-center">
              <dt className="text-xs text-slate-400">Resource</dt>
              <dd className="text-xs font-semibold text-slate-900 truncate">
                {specialist?.name ?? 'Unknown Specialist'}
              </dd>
            </div>

            <div className="py-3 grid grid-cols-[110px_1fr] items-center">
              <dt className="text-xs text-slate-400">Service</dt>
              <dd className="text-xs font-semibold text-slate-900 truncate">
                {appointment.serviceName}
              </dd>
            </div>

            <div className="py-3 grid grid-cols-[110px_1fr] items-center">
              <dt className="text-xs text-slate-400">Time</dt>
              <dd className="text-xs font-semibold text-slate-900">
                {appointment.startTime} - {appointment.endTime}
              </dd>
            </div>

            <div className="py-3 grid grid-cols-[110px_1fr] items-center">
              <dt className="text-xs text-slate-400">Duration</dt>
              <dd className="text-xs font-semibold text-slate-900">
                {durationLabel}
              </dd>
            </div>
          </dl>

          {/* Notes */}
          <div className="mt-5">
            <label
              htmlFor="appointment-notes"
              className="block text-xs font-semibold text-slate-900 mb-2"
            >
              Notes
            </label>
            <textarea
              id="appointment-notes"
              rows={4}
              placeholder="Add a note for the team"
              value={appointment.notes ?? ''}
              onChange={(e) =>
                updateAppointment(appointment.id, { notes: e.target.value })
              }
              className="w-full rounded-xl border border-slate-200/90 px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/15 resize-none"
            />
          </div>
        </div>

        {/* Bottom Action Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-white flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setIsDeleteConfirmOpen(true)}
            className="px-4 py-2 rounded-lg border border-rose-200 text-xs font-medium text-rose-500 hover:bg-rose-50 hover:border-rose-300 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsRescheduleOpen(true)}
              className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Reschedule
            </button>

            <button
              type="button"
              disabled={isCompleted}
              onClick={() => completeAppointment(appointment.id)}
              className={clsx(
                'inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-colors',
                isCompleted
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs cursor-pointer'
              )}
            >
              {isCompleted && <Check className="w-3.5 h-3.5" />}
              {isCompleted ? 'Completed' : 'Complete'}
            </button>
          </div>
        </div>
      </aside>

      {/* Sub-Modals */}
      {isRescheduleOpen && (
        <RescheduleModal
          appointment={appointment}
          onClose={() => setIsRescheduleOpen(false)}
        />
      )}

      {isDeleteConfirmOpen && (
        <DeleteConfirmationModal
          onConfirmDelete={handleConfirmDelete}
          onCancel={() => setIsDeleteConfirmOpen(false)}
        />
      )}
    </>
  );
};