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
 * Генерирует массив временных слотов от startHour до endHour.
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
 * Генерирует список доступных вариантов времени для селектов формы.
 */
export const generateTimeOptions = (
  includeEndBoundary: boolean = false
): string[] => {
  const options: string[] = [];
  const limit = includeEndBoundary
    ? END_DAY_MINUTES
    : END_DAY_MINUTES - SCHEDULE_CONFIG.STEP_MINUTES;

  for (let m = START_DAY_MINUTES; m <= limit; m += SCHEDULE_CONFIG.STEP_MINUTES) {
    options.push(minutesToTime(m));
  }

  return options;
};

/**
 * Проверяет пересечение интервала [startTime, endTime) на указанную дату у специалиста.
 */
export const hasAppointmentOverlap = (
  appointments: Appointment[],
  specialistId: string,
  date: string,
  startTime: string,
  endTime: string,
  excludeAppointmentId?: string
): boolean => {
  const candidateStart = timeToMinutes(startTime);
  const candidateEnd = timeToMinutes(endTime);

  return appointments.some((appointment) => {
    if (appointment.specialistId !== specialistId) return false;
    if (appointment.date !== date) return false;
    if (excludeAppointmentId && appointment.id === excludeAppointmentId) return false;

    const existingStart = timeToMinutes(appointment.startTime);
    const existingEnd = timeToMinutes(appointment.endTime);

    return candidateStart < existingEnd && candidateEnd > existingStart;
  });
};

/**
 * Форматирует продолжительность записи в человекочитаемый вид ("1 h", "1 h 30 m", "30 m").
 */
export const formatDuration = (startTime: string, endTime: string): string => {
  const totalMinutes = Math.max(0, timeToMinutes(endTime) - timeToMinutes(startTime));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0 && minutes > 0) return `${hours} h ${minutes} m`;
  if (hours > 0) return `${hours} h`;
  return `${minutes} m`;
};

const parseIsoDateLocal = (isoDate: string): Date => {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day);
};

/**
 * Форматирует ISO-дату "2026-10-22" в "Thursday, 22 October 2026".
 */
export const formatFullDate = (isoDate: string): string => {
  const date = parseIsoDateLocal(isoDate);
  const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
  const day = date.getDate();
  const month = date.toLocaleDateString('en-US', { month: 'long' });
  const year = date.getFullYear();
  return `${weekday}, ${day} ${month} ${year}`;
};

/**
 * Форматирует ISO-дату "2026-10-22" в "Thu, 22 Oct 2026".
 */
export const formatShortDate = (isoDate: string): string => {
  const date = parseIsoDateLocal(isoDate);
  const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
  const day = date.getDate();
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const year = date.getFullYear();
  return `${weekday}, ${day} ${month} ${year}`;
};

/**
 * Извлекает инициалы из имени клиента ("D. Lindgren" -> "DL", "John Doe" -> "JD").
 */
export const getInitials = (name: string): string => {
  const parts = name
    .replace(/\./g, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};