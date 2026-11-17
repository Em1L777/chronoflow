import { create } from 'zustand';
import type {
  Appointment,
  CreateAppointmentPayload,
  DragPreview,
  Specialist,
} from '../types';

interface ScheduleState {
  currentDate: string;
  timeZone: string;
  specialists: Specialist[];
  appointments: Appointment[];
  selectedAppointmentId: string | null;
  dragPreview: DragPreview | null;

  setSelectedAppointment: (id: string | null) => void;
  setDragPreview: (preview: DragPreview | null) => void;
  addAppointment: (payload: CreateAppointmentPayload) => void;
  updateAppointment: (id: string, patch: Partial<Omit<Appointment, 'id'>>) => void;
}

const MOCK_SPECIALISTS: Specialist[] = [
  { id: 'spec-1', name: 'Anna Kovacs', role: 'Stylist', avatarInitials: 'AK' },
  { id: 'spec-2', name: 'Marco Reyes', role: 'Barber', avatarInitials: 'AK' },
  { id: 'spec-3', name: 'Anna Kovacs', role: 'Stylist', avatarInitials: 'AK' },
  { id: 'spec-4', name: 'Anna Kovacs', role: 'Stylist', avatarInitials: 'AK' },
  { id: 'spec-5', name: 'Anna Kovacs', role: 'Stylist', avatarInitials: 'AK' },
];

const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: 'app-1',
    specialistId: 'spec-1',
    startTime: '09:00',
    endTime: '10:00',
    serviceName: 'Haircut & style',
    clientName: 'J. Morgan',
    colorVariant: 'slate',
  },
  {
    id: 'app-2',
    specialistId: 'spec-2',
    startTime: '14:30',
    endTime: '15:30',
    serviceName: 'Haircut',
    clientName: 'J. Morgan',
    colorVariant: 'rose',
  },
  {
    id: 'app-3',
    specialistId: 'spec-3',
    startTime: '14:30',
    endTime: '16:30',
    serviceName: 'Full Color',
    clientName: 'J. Morgan',
    colorVariant: 'sky',
  },
];

export const useScheduleStore = create<ScheduleState>((set) => ({
  currentDate: 'Thursday, 22 October 2026',
  timeZone: 'CEST',
  specialists: MOCK_SPECIALISTS,
  appointments: MOCK_APPOINTMENTS,
  selectedAppointmentId: null,
  dragPreview: null,

  setSelectedAppointment: (id) => set({ selectedAppointmentId: id }),

  setDragPreview: (preview) => set({ dragPreview: preview }),

  addAppointment: (payload) =>
    set((state) => ({
      appointments: [
        ...state.appointments,
        {
          ...payload,
          id: `app-${crypto.randomUUID().slice(0, 8)}`,
        },
      ],
    })),

  updateAppointment: (id, patch) =>
    set((state) => ({
      appointments: state.appointments.map((app) =>
        app.id === id ? { ...app, ...patch } : app
      ),
    })),
}));