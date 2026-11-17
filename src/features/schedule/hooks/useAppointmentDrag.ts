import React, { useRef, useState } from 'react';
import {
  END_DAY_MINUTES,
  SCHEDULE_CONFIG,
  START_DAY_MINUTES,
} from '../constants';
import type { Appointment, DragPreview, Specialist } from '../types';
import {
  hasAppointmentOverlap,
  minutesToTime,
  timeToMinutes,
} from '../utils/time';

const DRAG_THRESHOLD_PX = 4;

interface DragSession {
  pointerId: number;
  startX: number;
  startY: number;
  initialStartMinutes: number;
  durationMinutes: number;
  hasActivated: boolean;
}

interface UseAppointmentDragParams {
  appointment: Appointment;
  specialists: Specialist[];
  allAppointments: Appointment[];
  gridColumnsRef: React.RefObject<HTMLDivElement | null>;
  onDragPreviewChange: (preview: DragPreview | null) => void;
  onCommitDrop: (
    appointmentId: string,
    patch: { specialistId: string; startTime: string; endTime: string }
  ) => void;
}

export const useAppointmentDrag = ({
  appointment,
  specialists,
  allAppointments,
  gridColumnsRef,
  onDragPreviewChange,
  onCommitDrop,
}: UseAppointmentDragParams) => {
  const sessionRef = useRef<DragSession | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const computeDropTarget = (
    session: DragSession,
    clientX: number,
    clientY: number
  ): DragPreview => {
    // 1. Вертикальный расчёт времени с сохранением длительности
    const deltaY = clientY - session.startY;
    const slotDelta = Math.round(deltaY / SCHEDULE_CONFIG.SLOT_HEIGHT_PX);
    const deltaMinutes = slotDelta * SCHEDULE_CONFIG.STEP_MINUTES;

    const maxStartMinutes = END_DAY_MINUTES - session.durationMinutes;
    const clampedStartMinutes = Math.max(
      START_DAY_MINUTES,
      Math.min(maxStartMinutes, session.initialStartMinutes + deltaMinutes)
    );
    const clampedEndMinutes = clampedStartMinutes + session.durationMinutes;

    const startTime = minutesToTime(clampedStartMinutes);
    const endTime = minutesToTime(clampedEndMinutes);

    // 2. Горизонтальный расчёт колонки специалиста
    let targetSpecialistId = appointment.specialistId;
    const columnsEl = gridColumnsRef.current;

    if (columnsEl && specialists.length > 0) {
      const rect = columnsEl.getBoundingClientRect();
      const relativeX = clientX - rect.left;
      const columnWidth = rect.width / specialists.length;
      const rawIndex = Math.floor(relativeX / columnWidth);
      const clampedIndex = Math.max(
        0,
        Math.min(specialists.length - 1, rawIndex)
      );
      targetSpecialistId = specialists[clampedIndex].id;
    }

    // 3. Проверка пересечения с другими записями целевого специалиста
    const overlaps = hasAppointmentOverlap(
      allAppointments,
      targetSpecialistId,
      startTime,
      endTime,
      appointment.id
    );

    return {
      appointmentId: appointment.id,
      specialistId: targetSpecialistId,
      startTime,
      endTime,
      serviceName: appointment.serviceName,
      clientName: appointment.clientName,
      colorVariant: appointment.colorVariant,
      isValid: !overlaps,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);

    const startMin = timeToMinutes(appointment.startTime);
    const endMin = timeToMinutes(appointment.endTime);

    sessionRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      initialStartMinutes: startMin,
      durationMinutes: endMin - startMin,
      hasActivated: false,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const session = sessionRef.current;
    if (!session || session.pointerId !== e.pointerId) return;

    e.stopPropagation();

    if (!session.hasActivated) {
      const distance = Math.hypot(
        e.clientX - session.startX,
        e.clientY - session.startY
      );
      if (distance < DRAG_THRESHOLD_PX) return;

      session.hasActivated = true;
      setIsDragging(true);
    }

    const preview = computeDropTarget(session, e.clientX, e.clientY);
    onDragPreviewChange(preview);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const session = sessionRef.current;
    if (!session || session.pointerId !== e.pointerId) return;

    e.stopPropagation();

    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }

    if (session.hasActivated) {
      const finalTarget = computeDropTarget(session, e.clientX, e.clientY);

      const hasChanged =
        finalTarget.specialistId !== appointment.specialistId ||
        finalTarget.startTime !== appointment.startTime ||
        finalTarget.endTime !== appointment.endTime;

      if (finalTarget.isValid && hasChanged) {
        onCommitDrop(appointment.id, {
          specialistId: finalTarget.specialistId,
          startTime: finalTarget.startTime,
          endTime: finalTarget.endTime,
        });
      }
    }

    sessionRef.current = null;
    setIsDragging(false);
    onDragPreviewChange(null);
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    const session = sessionRef.current;
    if (!session || session.pointerId !== e.pointerId) return;

    e.stopPropagation();
    sessionRef.current = null;
    setIsDragging(false);
    onDragPreviewChange(null);
  };

  return {
    isDragging,
    dragHandlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerCancel,
    },
  };
};