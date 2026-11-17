import {
  END_DAY_MINUTES,
  SCHEDULE_CONFIG,
  START_DAY_MINUTES,
} from '../constants';
import type { Appointment } from '../types';

/**
 * Преобразует строку "HH:mm" в количество минут от 00:00.
 */
export const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Преобразует количество минут от 00:00 в строку "HH:mm".
 */
export const minutesToTime = (totalMinutes: number): string => {
  const clamped = Math.max(0, Math.min(24 * 60, Math.round(totalMinutes)));
  const hours = Math.floor(clamped / 60);
  const minutes = clamped % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

/**
 * Привязывает значение минут к шагу сетки (Snap to Grid) в пределах рабочего дня.
 */
export const snapMinutesToGrid = (
  minutes: number,
  stepMinutes: number = SCHEDULE_CONFIG.STEP_MINUTES
): number => {
  const snapped = Math.round(minutes / stepMinutes) * stepMinutes;
  return Math.max(START_DAY_MINUTES, Math.min(END_DAY_MINUTES, snapped));
};

/**
 * Генерирует массив временных слотов от startHour до endHour (не включая конечную границу как начало слота).
 */
export const generateTimeSlots = (
  startHour: number = SCHEDULE_CONFIG.START_HOUR,
  endHour: number = SCHEDULE_CONFIG.END_HOUR,
  stepMinutes: number = SCHEDULE_CONFIG.STEP_MINUTES
): string[] => {
  const slots: string[] = [];
  const startMinutes = startHour * 60;
  const endMinutes = endHour * 60;

  for (let minutes = startMinutes; minutes < endMinutes; minutes += stepMinutes) {
    slots.push(minutesToTime(minutes));
  }

  return slots;
};

/**
 * Генерирует список доступных вариантов времени для селектов формы (включая 18:00 для endTime).
 */
export const generateTimeOptions = (
  includeEndBoundary: boolean = false
): string[] => {
  const options: string[] = [];
  const limit = includeEndBoundary ? END_DAY_MINUTES : END_DAY_MINUTES - SCHEDULE_CONFIG.STEP_MINUTES;

  for (let m = START_DAY_MINUTES; m <= limit; m += SCHEDULE_CONFIG.STEP_MINUTES) {
    options.push(minutesToTime(m));
  }

  return options;
};

/**
 * Проверяет, пересекается ли интервал [startTime, endTime) с существующими записями специалиста.
 */
export const hasAppointmentOverlap = (
  appointments: Appointment[],
  specialistId: string,
  startTime: string,
  endTime: string,
  excludeAppointmentId?: string
): boolean => {
  const candidateStart = timeToMinutes(startTime);
  const candidateEnd = timeToMinutes(endTime);

  return appointments.some((appointment) => {
    if (appointment.specialistId !== specialistId) return false;
    if (excludeAppointmentId && appointment.id === excludeAppointmentId) return false;

    const existingStart = timeToMinutes(appointment.startTime);
    const existingEnd = timeToMinutes(appointment.endTime);

    return candidateStart < existingEnd && candidateEnd > existingStart;
  });
};