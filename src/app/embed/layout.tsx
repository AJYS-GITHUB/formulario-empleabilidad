import BookingForm from '../components/BookingForm';

export default function EmbedPage() {
  return (
    <div style={{ 
      margin: 0, 
      padding: 0, 
      background: 'transparent',
      minHeight: 'auto',
      width: '100%'
    }}>
      <BookingForm />
    </div>
  );
}

export const metadata = {
  title: 'Formulario UCV',
  description: 'Formulario de reserva',
};