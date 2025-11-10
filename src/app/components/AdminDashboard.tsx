'use client';

import { useState, useEffect } from 'react';
import { format, parse } from 'date-fns';
import { es } from 'date-fns/locale';

interface TimeSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  maxAttendees: number;
  title?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  expositor: {
    id: number;
    name: string;
    lastName: string;
    speciality: string;
  };
}

interface Expositor {
  id: number;
  name: string;
  lastName: string;
  email: string;
  phone?: string;
  speciality: string;
  bio?: string;
  isActive: boolean;
  createdAt: string;
}

interface Booking {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  document: string;
  campus?: string;
  academicStatus?: string;
  academicLevel?: string;
  advisoryTopic?: string;
  occupation?: string;
  comments?: string;
  status: string;
  createdAt: string;
  timeSlot: {
    date: string;
    startTime: string;
    endTime: string;
  };
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'schedules' | 'bookings' | 'expositors'>('schedules');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [expositors, setExpositors] = useState<Expositor[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // New time slot form
  const [newSlot, setNewSlot] = useState({
    date: '',
    startTime: '',
    endTime: '',
    maxAttendees: 10,
    title: '',
    description: '',
    expositorId: 0
  });

  // New expositor form
  const [newExpositor, setNewExpositor] = useState({
    name: '',
    lastName: '',
    email: '',
    phone: '',
    speciality: '',
    bio: ''
  });

  useEffect(() => {
    if (activeTab === 'schedules') {
      fetchTimeSlots();
      fetchExpositors(); // También necesitamos expositores para crear horarios
    } else if (activeTab === 'bookings') {
      fetchBookings();
    } else if (activeTab === 'expositors') {
      fetchExpositors();
    }
  }, [activeTab]);

  const fetchTimeSlots = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/timeslots');
      if (response.ok) {
        const data = await response.json();
        setTimeSlots(data);
      }
    } catch (error) {
      console.error('Error fetching time slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExpositors = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/expositors');
      if (response.ok) {
        const data = await response.json();
        setExpositors(data);
      }
    } catch (error) {
      console.error('Error fetching expositors:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/bookings');
      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTimeSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/timeslots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSlot),
      });

      if (response.ok) {
        setNewSlot({ 
          date: '', 
          startTime: '', 
          endTime: '', 
          maxAttendees: 10, 
          title: '', 
          description: '', 
          expositorId: 0 
        });
        fetchTimeSlots();
        alert('Horario creado exitosamente');
      } else {
        const error = await response.json();
        alert(error.error || 'Error al crear horario');
      }
    } catch (error) {
      console.error('Error creating time slot:', error);
      alert('Error al conectar con el servidor');
    }
  };

  const handleCreateExpositor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/expositors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newExpositor),
      });

      if (response.ok) {
        setNewExpositor({
          name: '',
          lastName: '',
          email: '',
          phone: '',
          speciality: '',
          bio: ''
        });
        fetchExpositors();
        alert('Expositor creado exitosamente');
      } else {
        const error = await response.json();
        alert(error.error || 'Error al crear expositor');
      }
    } catch (error) {
      console.error('Error creating expositor:', error);
      alert('Error al conectar con el servidor');
    }
  };

  const handleToggleExpositor = async (id: number, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/expositors/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (response.ok) {
        fetchExpositors();
      }
    } catch (error) {
      console.error('Error updating expositor:', error);
    }
  };

  const handleToggleSlot = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/timeslots/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (response.ok) {
        fetchTimeSlots();
      }
    } catch (error) {
      console.error('Error updating time slot:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = parse(dateString, 'yyyy-MM-dd', new Date());
    return format(date, "EEEE d 'de' MMMM, yyyy", { locale: es });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "dd/MM/yyyy 'a las' HH:mm", { locale: es });
  };

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('schedules')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'schedules'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Gestión de Horarios
          </button>
          <button
            onClick={() => setActiveTab('expositors')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'expositors'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Gestión de Expositores
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'bookings'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Registros de Reservas
          </button>
        </nav>
      </div>

      {/* Schedules Tab */}
      {activeTab === 'schedules' && (
        <div className="space-y-6">
          {/* Create New Time Slot */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Crear Nuevo Horario</h2>
            <form onSubmit={handleCreateTimeSlot} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha
                  </label>
                  <input
                    type="date"
                    value={newSlot.date}
                    onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hora Inicio
                  </label>
                  <input
                    type="time"
                    value={newSlot.startTime}
                    onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                    required
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hora Fin
                  </label>
                  <input
                    type="time"
                    value={newSlot.endTime}
                    onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                    required
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expositor *
                  </label>
                  <select
                    value={newSlot.expositorId}
                    onChange={(e) => setNewSlot({ ...newSlot, expositorId: parseInt(e.target.value) })}
                    required
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Seleccione un expositor</option>
                    {expositors.filter(exp => exp.isActive).map((expositor) => (
                      <option key={expositor.id} value={expositor.id}>
                        {expositor.name} {expositor.lastName} - {expositor.speciality}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Máx. Asistentes
                  </label>
                  <input
                    type="number"
                    value={newSlot.maxAttendees}
                    onChange={(e) => setNewSlot({ ...newSlot, maxAttendees: parseInt(e.target.value) })}
                    min="1"
                    max="50"
                    required
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título de la Sesión
                </label>
                <input
                  type="text"
                  value={newSlot.title}
                  onChange={(e) => setNewSlot({ ...newSlot, title: e.target.value })}
                  placeholder="Ej: Técnicas de Entrevista"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={newSlot.description}
                  onChange={(e) => setNewSlot({ ...newSlot, description: e.target.value })}
                  rows={3}
                  placeholder="Descripción detallada de la sesión..."
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition duration-200"
              >
                Crear Horario
              </button>
            </form>
          </div>

          {/* Time Slots List */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold">Horarios Existentes</h2>
            </div>
            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-6 text-center">Cargando...</div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha y Hora
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Expositor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tema
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Capacidad
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {timeSlots.map((slot) => (
                      <tr key={slot.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatDate(slot.date)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {slot.startTime} - {slot.endTime}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {slot.expositor.name} {slot.expositor.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {slot.expositor.speciality}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {slot.title || 'Sin título específico'}
                          </div>
                          {slot.description && (
                            <div className="text-sm text-gray-500 max-w-xs truncate">
                              {slot.description}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {slot.maxAttendees} personas
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            slot.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {slot.isActive ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleToggleSlot(slot.id, slot.isActive)}
                            className={`${
                              slot.isActive
                                ? 'text-red-600 hover:text-red-900'
                                : 'text-green-600 hover:text-green-900'
                            }`}
                          >
                            {slot.isActive ? 'Desactivar' : 'Activar'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Expositors Tab */}
      {activeTab === 'expositors' && (
        <div className="space-y-6">
          {/* Create New Expositor */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Registrar Nuevo Expositor</h2>
            <form onSubmit={handleCreateExpositor} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={newExpositor.name}
                    onChange={(e) => setNewExpositor({ ...newExpositor, name: e.target.value })}
                    required
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Apellido *
                  </label>
                  <input
                    type="text"
                    value={newExpositor.lastName}
                    onChange={(e) => setNewExpositor({ ...newExpositor, lastName: e.target.value })}
                    required
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={newExpositor.email}
                    onChange={(e) => setNewExpositor({ ...newExpositor, email: e.target.value })}
                    required
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={newExpositor.phone}
                    onChange={(e) => setNewExpositor({ ...newExpositor, phone: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Área de Especialidad *
                </label>
                <input
                  type="text"
                  value={newExpositor.speciality}
                  onChange={(e) => setNewExpositor({ ...newExpositor, speciality: e.target.value })}
                  placeholder="Ej: Recursos Humanos, Psicología Laboral, Coaching"
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Biografía o Descripción
                </label>
                <textarea
                  value={newExpositor.bio}
                  onChange={(e) => setNewExpositor({ ...newExpositor, bio: e.target.value })}
                  rows={4}
                  placeholder="Experiencia profesional, formación académica, logros destacados..."
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition duration-200"
              >
                Registrar Expositor
              </button>
            </form>
          </div>

          {/* Expositors List */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold">Lista de Expositores</h2>
              <p className="text-gray-600 mt-1">
                Total de expositores: {expositors.length}
              </p>
            </div>
            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-6 text-center">Cargando...</div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Expositor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contacto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Especialidad
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {expositors.map((expositor) => (
                      <tr key={expositor.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {expositor.name} {expositor.lastName}
                          </div>
                          {expositor.bio && (
                            <div className="text-sm text-gray-500 max-w-xs truncate">
                              {expositor.bio}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{expositor.email}</div>
                          {expositor.phone && (
                            <div className="text-sm text-gray-500">{expositor.phone}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {expositor.speciality}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            expositor.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {expositor.isActive ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleToggleExpositor(expositor.id, expositor.isActive)}
                            className={`${
                              expositor.isActive
                                ? 'text-red-600 hover:text-red-900'
                                : 'text-green-600 hover:text-green-900'
                            }`}
                          >
                            {expositor.isActive ? 'Desactivar' : 'Activar'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Registros de Reservas</h2>
            <p className="text-gray-600 mt-1">
              Total de reservas: {bookings.length}
            </p>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-6 text-center">Cargando...</div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Participante
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contacto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Horario de Cita
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tema de Asesoría
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha de Registro
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookings.map((booking) => (
                    <tr key={booking.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {booking.firstName} {booking.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {booking.document}
                        </div>
                        {booking.occupation && (
                          <div className="text-sm text-gray-500">
                            {booking.occupation}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{booking.email}</div>
                        {booking.phone && (
                          <div className="text-sm text-gray-500">{booking.phone}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatDate(booking.timeSlot.date)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {booking.timeSlot.startTime} - {booking.timeSlot.endTime}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {booking.advisoryTopic || 'No especificado'}
                        </div>
                        {booking.campus && (
                          <div className="text-sm text-gray-500">
                            Campus: {booking.campus}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDateTime(booking.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          booking.status === 'confirmed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {booking.status === 'confirmed' ? 'Confirmada' : 'Cancelada'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}