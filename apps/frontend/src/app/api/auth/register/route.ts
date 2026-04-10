import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function generateToken(userId: string, role: string): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const payload = Buffer.from(JSON.stringify({ userId, role, exp: Date.now() + 86400000 })).toString('base64');
  const signature = crypto.randomBytes(16).toString('hex');
  return `${header}.${payload}.${signature}`;
}

export async function POST(req: Request) {
  try {
    const { email, password, role } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const newUser = await prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        email,
        password: hashPassword(password),
        role: (role as string)?.toUpperCase() || 'PATIENT',
      }
    });

    const token = generateToken(newUser.id, newUser.role);

    return NextResponse.json({
      message: 'Registration successful',
      token,
      user: { id: newUser.id, email: newUser.email, role: newUser.role }
    }, { status: 201 });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
