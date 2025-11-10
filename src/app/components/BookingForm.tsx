'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, parse } from 'date-fns';
import { es } from 'date-fns/locale';
import SimpleCaptcha from './SimpleCaptcha';

const bookingSchema = z.object({
  fullName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  phone: z.string().min(10, 'El celular debe tener al menos 10 dígitos'),
  email: z.string().email('Ingrese un email válido'),
  document: z.string().min(6, 'El DNI debe tener al menos 6 caracteres'),
  campus: z.string().min(1, 'Debe seleccionar un campus'),
  academicStatus: z.string().min(1, 'Debe seleccionar su estatus académico'),
  academicLevel: z.string().min(1, 'Debe seleccionar nivel académico'),
  advisoryTopic: z.string().min(1, 'Debe seleccionar un tema de asesoría'),
  timeSlotId: z.string().min(1, 'Debe seleccionar un horario'),
  captcha: z.string().min(5, 'Debe completar el captcha'),
});

type BookingForm = z.infer<typeof bookingSchema>;

interface TimeSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  maxAttendees: number;
  title?: string;
  description?: string;
  currentBookings: number;
  expositor: {
    id: string;
    name: string;
    lastName: string;
    speciality: string;
    bio?: string;
  };
}

const campusOptions = [
  'Ate',
  'Callao',
  'Chepén',
  'Chiclayo',
  'Chimbote',
  'Huaraz',
  'San Juan de Lurigancho',
  'Los Olivos',
  'Moyobamba',
  'Piura',
  'Tarapoto',
  'Trujillo'
];

const academicStatusOptions = [
  'Estudiante',
  'Egresado'
];

const academicLevelOptions = [
  'Pregrado',
  'Posgrado'
];

export default function BookingForm() {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [availableTopics, setAvailableTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [captchaValid, setCaptchaValid] = useState(false);
  const [captchaValue, setCaptchaValue] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<BookingForm>({
    resolver: zodResolver(bookingSchema),
  });

  const selectedTopic = watch('advisoryTopic');

  useEffect(() => {
    fetchTimeSlots();
  }, []);

  const fetchTimeSlots = async () => {
    try {
      const response = await fetch('/api/timeslots');
      if (response.ok) {
        const data = await response.json();
        setTimeSlots(data);
        
        // Extract unique topics from time slots
        const topics = [...new Set(data.map((slot: TimeSlot) => slot.title).filter(Boolean))] as string[];
        setAvailableTopics(topics);
      }
    } catch (error) {
      console.error('Error fetching time slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: BookingForm) => {
    if (!captchaValid) {
      alert('Por favor complete el captcha correctamente');
      return;
    }

    setSubmitting(true);
    try {
      // Separar nombre completo en firstName y lastName
      const nameParts = data.fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || nameParts[0] || '';

      // Enviar data con los campos requeridos por la API
      const payload = {
        timeSlotId: data.timeSlotId,
        firstName: firstName,
        lastName: lastName,
        email: data.email,
        phone: data.phone,
        document: data.document,
        campus: data.campus,
        academicStatus: data.academicStatus,
        academicLevel: data.academicLevel,
        advisoryTopic: data.advisoryTopic,
        advisoryType: data.advisoryTopic,
        serviceOption: data.academicLevel,
        occupation: data.academicStatus,
        comments: `Campus: ${data.campus}, Estatus: ${data.academicStatus}, Nivel: ${data.academicLevel}, Tema: ${data.advisoryTopic}`,
      };

      console.log('Enviando payload:', payload); // Para debug

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setSuccess(true);
        reset();
        setCaptchaValue('');
        setCaptchaValid(false);
        fetchTimeSlots();
      } else {
        const error = await response.json();
        console.error('Error del servidor:', error); // Para debug
        alert(error.error || 'Error al procesar la reserva');
      }
    } catch (error) {
      console.error('Error submitting booking:', error);
      alert('Error al conectar con el servidor');
    } finally {
      setSubmitting(false);
    }
  };

  const getFilteredTimeSlotsByTopic = () => {
    if (!selectedTopic) return [];
    return timeSlots.filter(slot => slot.title === selectedTopic);
  };

  const formatTimeSlot = (slot: TimeSlot) => {
    const date = parse(slot.date, 'yyyy-MM-dd', new Date());
    const dateStr = format(date, "EEEE d 'de' MMMM", { locale: es });
    const available = slot.maxAttendees - slot.currentBookings;
    const title = slot.title ? ` - ${slot.title}` : '';
    const expositorInfo = ` con ${slot.expositor.name} ${slot.expositor.lastName} (${slot.expositor.speciality})`;
    
    return {
      label: `${dateStr} - ${slot.startTime} a ${slot.endTime}${title}${expositorInfo} (${available} cupos disponibles)`,
      disabled: available <= 0,
    };
  };

  if (success) {
    return (
      <div className="w-full" style={{ background: 'transparent', padding: '8px' }}>
        <div className="text-center bg-white p-8 rounded-lg border border-gray-200">
          <div className="text-green-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">¡Reserva Confirmada!</h2>
          <p className="text-gray-600 mb-6">
            Hemos recibido su solicitud de cita. Le confirmaremos la reserva por email.
          </p>
          <button
            onClick={() => setSuccess(false)}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition duration-200 mx-auto"
          >
            Hacer otra reserva
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full" style={{ background: 'transparent', padding: '8px' }}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white p-6 rounded-lg border border-gray-200" style={{ width: '100%' }}>
            {/* Nombres y Apellidos */}
            <div>
              <input
                type="text"
                {...register('fullName')}
                placeholder="Nombres y Apellidos"
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
              />
              {errors.fullName && (
                <p className="text-red-600 text-sm mt-1">{errors.fullName.message}</p>
              )}
            </div>

            {/* Celular */}
            <div>
              <input
                type="tel"
                {...register('phone')}
                placeholder="Celular"
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
              />
              {errors.phone && (
                <p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>
              )}
            </div>

            {/* Correo electrónico */}
            <div>
              <input
                type="email"
                {...register('email')}
                placeholder="Correo electrónico"
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* DNI */}
            <div>
              <input
                type="text"
                {...register('document')}
                placeholder="DNI"
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
              />
              {errors.document && (
                <p className="text-red-600 text-sm mt-1">{errors.document.message}</p>
              )}
            </div>

            {/* Campus */}
            <div>
              <select
                {...register('campus')}
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 bg-white"
              >
                <option value="">Campus</option>
                {campusOptions.map((campus) => (
                  <option key={campus} value={campus}>
                    {campus}
                  </option>
                ))}
              </select>
              {errors.campus && (
                <p className="text-red-600 text-sm mt-1">{errors.campus.message}</p>
              )}
            </div>

            {/* Estatus Académico */}
            <div>
              <select
                {...register('academicStatus')}
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 bg-white"
              >
                <option value="">Seleccionar</option>
                {academicStatusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              {errors.academicStatus && (
                <p className="text-red-600 text-sm mt-1">{errors.academicStatus.message}</p>
              )}
            </div>

            {/* Nivel Académico */}
            <div>
              <select
                {...register('academicLevel')}
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 bg-white"
              >
                <option value="">Seleccionar</option>
                {academicLevelOptions.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
              {errors.academicLevel && (
                <p className="text-red-600 text-sm mt-1">{errors.academicLevel.message}</p>
              )}
            </div>

            {/* Tema de Asesoría */}
            <div>
              <select
                {...register('advisoryTopic')}
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 bg-white"
              >
                <option value="">Seleccionar tema de asesoría</option>
                {availableTopics.map((topic) => (
                  <option key={topic} value={topic}>
                    {topic}
                  </option>
                ))}
              </select>
              {errors.advisoryTopic && (
                <p className="text-red-600 text-sm mt-1">{errors.advisoryTopic.message}</p>
              )}
            </div>

            {/* Elegir asesoría (Horarios disponibles filtrados por tema) */}
            <div>
              <select
                {...register('timeSlotId')}
                disabled={!selectedTopic}
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 bg-white disabled:bg-gray-100"
              >
                <option value="">Elegir asesoría</option>
                {getFilteredTimeSlotsByTopic().map((slot) => {
                  const formatted = formatTimeSlot(slot);
                  return (
                    <option
                      key={slot.id}
                      value={slot.id}
                      disabled={formatted.disabled}
                    >
                      {formatted.label}
                    </option>
                  );
                })}
              </select>
              {errors.timeSlotId && (
                <p className="text-red-600 text-sm mt-1">{errors.timeSlotId.message}</p>
              )}
            </div>

            {/* Captcha */}
            <div>
              <p className="text-gray-600 text-sm mb-2">por favor completa el captcha.</p>
              <SimpleCaptcha
                value={captchaValue}
                onChange={(value) => {
                  setCaptchaValue(value);
                  setValue('captcha', value);
                }}
                onVerify={setCaptchaValid}
              />
              {errors.captcha && (
                <p className="text-red-600 text-sm mt-1">{errors.captcha.message}</p>
              )}
            </div>

            {/* Mensaje informativo */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-700 text-sm">
                Las inscripciones se realizan con 1 semana de anticipación
              </p>
            </div>

            {/* Botón enviar */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition duration-200"
            >
              {submitting ? 'Procesando...' : 'Enviar'}
            </button>
            
            {/* Mensaje de ayuda */}
            {!captchaValid && captchaValue && (
              <p className="text-orange-600 text-sm text-center">Complete correctamente el captcha para habilitar el envío</p>
            )}
          </form>
    </div>
  );
}