import BookingForm from './components/BookingForm';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Servicio de Empleabilidad UCV
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Reserve su cita para recibir orientación personalizada en búsqueda de empleo, 
            preparación de entrevistas y desarrollo de habilidades profesionales.
          </p>
        </div>
        
        <div className="max-w-2xl mx-auto">
          <BookingForm />
        </div>
      </div>
    </div>
  );
}
