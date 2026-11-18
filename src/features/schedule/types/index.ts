export interface Specialist {
  id: string;
  name: string;
  role: string;
  avatarInitials: string;
  avatarBgColor?: string;
}

export type AppointmentColor = 'slate' | 'rose' | 'sky';

export type AppointmentStatus = 'scheduled' | 'completed';

export interface Appointment {
  id: string;
  specialistId: string;
  date: string;       // ISO формат "YYYY-MM-DD", например "2026-10-22"
  startTime: string;  // формат "HH:mm", например "09:00"
  endTime: string;    // формат "HH:mm", например "10:00"
  serviceName: string;
  clientName: string;
  colorVariant: AppointmentColor;
  status: AppointmentStatus;
  notes?: string;
}

export type CreateAppointmentPayload = Omit<Appointment, 'id'>;

export interface SelectedSlot {
  specialistId: string;
  startTime: string;
}

export interface DragPreview {
  appointmentId: string;
  specialistId: string;
  startTime: string;
  endTime: string;
  serviceName: string;
  clientName: string;
  colorVariant: AppointmentColor;
  isValid: boolean;
}