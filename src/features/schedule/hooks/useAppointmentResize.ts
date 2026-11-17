import React, { useEffect, useRef, useState } from 'react';
import {
  END_DAY_MINUTES,
  SCHEDULE_CONFIG,
  START_DAY_MINUTES,
} from '../constants';
import type { Appointment } from '../types';
import {
  hasAppointmentOverlap,
  minutesToTime,
  timeToMinutes,
} from '../utils/time';

export type ResizeEdge = 'top' | 'bottom';

interface ResizeSession {
  edge: ResizeEdge;
  startY: number;
  initialStartMinutes: number;
  initialEndMinutes: number;
}

interface UseAppointmentResizeParams {
  appointment: Appointment;
  allAppointments: Appointment[];
  onCommitResize: (
    appointmentId: string,
    nextTimes: { startTime: string; endTime: string }
  ) => void;
}

export const useAppointmentResize = ({
  appointment,
  allAppointments,
  onCommitResize,
}: UseAppointmentResizeParams) => {
  const sessionRef = useRef<ResizeSession | null>(null);

  const [previewTimes, setPreviewTimes] = useState<{
    startTime: string;
    endTime: string;
  } | null>(null);

  const [isInvalidOverlap, setIsInvalidOverlap] = useState(false);

  const isResizing = previewTimes !== null;

  useEffect(() => {
    if (!isResizing) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && sessionRef.current) {
        sessionRef.current = null;
        setPreviewTimes(null);
        setIsInvalidOverlap(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isResizing]);

  const calculateNextTimes = (
    session: ResizeSession,
    currentClientY: number
  ): { startTime: string; endTime: string } => {
    const deltaY = currentClientY - session.startY;
    const rawSlotDelta = Math.round(deltaY / SCHEDULE_CONFIG.SLOT_HEIGHT_PX);
    const deltaMinutes = rawSlotDelta * SCHEDULE_CONFIG.STEP_MINUTES;

    if (session.edge === 'top') {
      const maxStartMinutes =
        session.initialEndMinutes - SCHEDULE_CONFIG.MIN_DURATION_MINUTES;
      const clampedStart = Math.max(
        START_DAY_MINUTES,
        Math.min(maxStartMinutes, session.initialStartMinutes + deltaMinutes)
      );

      return {
        startTime: minutesToTime(clampedStart),
        endTime: minutesToTime(session.initialEndMinutes),
      };
    }

    const minEndMinutes =
      session.initialStartMinutes + SCHEDULE_CONFIG.MIN_DURATION_MINUTES;
    const clampedEnd = Math.max(
      minEndMinutes,
      Math.min(END_DAY_MINUTES, session.initialEndMinutes + deltaMinutes)
    );

    return {
      startTime: minutesToTime(session.initialStartMinutes),
      endTime: minutesToTime(clampedEnd),
    };
  };

  const handleResizePointerDown =
    (edge: ResizeEdge) => (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.button !== 0 && e.pointerType === 'mouse') return;

      e.stopPropagation();
      e.currentTarget.setPointerCapture(e.pointerId);

      sessionRef.current = {
        edge,
        startY: e.clientY,
        initialStartMinutes: timeToMinutes(appointment.startTime),
        initialEndMinutes: timeToMinutes(appointment.endTime),
      };

      setPreviewTimes({
        startTime: appointment.startTime,
        endTime: appointment.endTime,
      });
      setIsInvalidOverlap(false);
    };

  const handleResizePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const session = sessionRef.current;
    if (!session) return;

    e.stopPropagation();

    const nextTimes = calculateNextTimes(session, e.clientY);

    if (
      previewTimes &&
      previewTimes.startTime === nextTimes.startTime &&
      previewTimes.endTime === nextTimes.endTime
    ) {
      return;
    }

    const overlaps = hasAppointmentOverlap(
      allAppointments,
      appointment.specialistId,
      nextTimes.startTime,
      nextTimes.endTime,
      appointment.id
    );

    setPreviewTimes(nextTimes);
    setIsInvalidOverlap(overlaps);
  };

  const finishResize = (e: React.PointerEvent<HTMLDivElement>) => {
    const session = sessionRef.current;
    if (!session) return;

    e.stopPropagation();

    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }

    const finalTimes = calculateNextTimes(session, e.clientY);
    const overlaps = hasAppointmentOverlap(
      allAppointments,
      appointment.specialistId,
      finalTimes.startTime,
      finalTimes.endTime,
      appointment.id
    );

    const hasChanged =
      finalTimes.startTime !== appointment.startTime ||
      finalTimes.endTime !== appointment.endTime;

    if (!overlaps && hasChanged) {
      onCommitResize(appointment.id, finalTimes);
    }

    sessionRef.current = null;
    setPreviewTimes(null);
    setIsInvalidOverlap(false);
  };

  const handleResizePointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!sessionRef.current) return;

    e.stopPropagation();
    sessionRef.current = null;
    setPreviewTimes(null);
    setIsInvalidOverlap(false);
  };

  const getResizeHandleProps = (edge: ResizeEdge) => ({
    onPointerDown: handleResizePointerDown(edge),
    onPointerMove: handleResizePointerMove,
    onPointerUp: finishResize,
    onPointerCancel: handleResizePointerCancel,
    onClick: (e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation(),
  });

  return {
    isResizing,
    isInvalidResize: isInvalidOverlap,
    displayStartTime: previewTimes?.startTime ?? appointment.startTime,
    displayEndTime: previewTimes?.endTime ?? appointment.endTime,
    getResizeHandleProps,
  };
};