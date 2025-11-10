'use client';

import { useState, useEffect, useRef } from 'react';

interface SimpleCaptchaProps {
  onVerify: (isValid: boolean) => void;
  value: string;
  onChange: (value: string) => void;
}

export default function SimpleCaptcha({ onVerify, value, onChange }: SimpleCaptchaProps) {
  const [captchaText, setCaptchaText] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateCaptcha = () => {
    // Generar texto aleatorio de 5 caracteres
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaText(result);
    return result;
  };

  const drawCaptcha = (text: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Fondo blanco
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Líneas de ruido
    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }

    // Texto del captcha
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#4F46E5';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Dibujar cada letra con ligera rotación
    const spacing = canvas.width / (text.length + 1);
    for (let i = 0; i < text.length; i++) {
      ctx.save();
      const x = spacing * (i + 1);
      const y = canvas.height / 2;
      const rotation = (Math.random() - 0.5) * 0.3;
      
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.fillText(text[i], 0, 0);
      ctx.restore();
    }
  };

  useEffect(() => {
    const text = generateCaptcha();
    drawCaptcha(text);
  }, []);

  const handleInputChange = (inputValue: string) => {
    onChange(inputValue);
    const isValid = inputValue.toUpperCase() === captchaText.toUpperCase();
    onVerify(isValid);
  };

  const refreshCaptcha = () => {
    const text = generateCaptcha();
    drawCaptcha(text);
    onChange('');
    onVerify(false);
  };

  return (
    <div className="flex items-center space-x-3">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={120}
          height={40}
          className="border border-gray-300 rounded"
        />
        <button
          type="button"
          onClick={refreshCaptcha}
          className="absolute -top-2 -right-2 bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-blue-700"
          title="Refrescar captcha"
        >
          ↻
        </button>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => handleInputChange(e.target.value)}
        placeholder="Ingrese el código"
        className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        maxLength={5}
      />
    </div>
  );
}