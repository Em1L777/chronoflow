/**
 * Преобразует строку времени HH:mm в количество минут от начала дня.
 */
export const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Генерирует массив слотов времени с шагом stepMinutes.
 */
export const generateTimeSlots = (
  startHour: number = 9,
  endHour: number = 18,
  stepMinutes: number = 30
): string[] => {
  const slots: string[] = [];
  const startMinutes = startHour * 60;
  const endMinutes = endHour * 60;

  for (let minutes = startMinutes; minutes <= endMinutes; minutes += stepMinutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    const formatted = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    slots.push(formatted);
  }

  return slots;
};