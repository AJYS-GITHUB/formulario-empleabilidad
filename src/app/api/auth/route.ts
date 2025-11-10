import { NextRequest, NextResponse } from 'next/server';
import * as crypto from 'crypto';

// Credenciales de administrador (en producción esto debería estar en variables de entorno)
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123'
};

// Función simple para crear un token seguro
function createToken(data: any): string {
  const payload = JSON.stringify({ ...data, exp: Date.now() + (24 * 60 * 60 * 1000) }); // 24h
  const secret = process.env.AUTH_SECRET || 'default-secret-change-in-production';
  const hash = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return Buffer.from(JSON.stringify({ payload, hash })).toString('base64');
}

// Función para verificar un token
function verifyToken(token: string): any {
  try {
    const secret = process.env.AUTH_SECRET || 'default-secret-change-in-production';
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    const { payload, hash } = decoded;
    
    // Verificar hash
    const expectedHash = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    if (hash !== expectedHash) {
      throw new Error('Token inválido');
    }
    
    const data = JSON.parse(payload);
    
    // Verificar expiración
    if (Date.now() > data.exp) {
      throw new Error('Token expirado');
    }
    
    return data;
  } catch (error) {
    throw new Error('Token inválido');
  }
}

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // Validar credenciales
    if (username !== ADMIN_CREDENTIALS.username || password !== ADMIN_CREDENTIALS.password) {
      return NextResponse.json(
        { error: 'Credenciales incorrectas' },
        { status: 401 }
      );
    }

    // Crear token
    const token = createToken({ username, role: 'admin' });

    // Crear respuesta con token en cookie
    const response = NextResponse.json({ 
      success: true,
      message: 'Autenticación exitosa' 
    });

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 horas
    });

    return response;
  } catch (error) {
    console.error('Error en autenticación:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    // Verificar token
    const userData = verifyToken(token);
    
    return NextResponse.json({
      authenticated: true,
      user: { username: userData.username, role: userData.role }
    });
  } catch (error) {
    console.error('Error verificando token:', error);
    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const response = NextResponse.json({ 
      success: true,
      message: 'Sesión cerrada exitosamente' 
    });

    // Eliminar cookie
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error('Error cerrando sesión:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}