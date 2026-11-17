export interface Specialist {
  id: string;
  name: string;
  role: string;
  avatarInitials: string;
  avatarBgColor?: string;
}

export type AppointmentColor = 'slate' | 'rose' | 'sky';

export interface Appointment {
  id: string;
  specialistId: string;
  startTime: string; // формат "HH:mm", например "09:00"
  endTime: string;   // формат "HH:mm", например "10:00"
  serviceName: string;
  clientName: string;
  colorVariant: AppointmentColor;
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