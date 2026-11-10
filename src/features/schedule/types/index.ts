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
  startTime: string; // HH:mm format, e.g. "09:00"
  endTime: string;   // HH:mm format, e.g. "10:00"
  serviceName: string;
  clientName: string;
  colorVariant: AppointmentColor;
}