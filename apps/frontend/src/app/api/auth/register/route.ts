import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getDB, saveDB, hashPassword, generateToken } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { email, password, role } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const db = getDB();
    
    const existingUser = db.users.find((u: any) => u.email === email);
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const newUser = {
      id: crypto.randomUUID(),
      email,
      password: hashPassword(password),
      role: role || 'PATIENT',
      createdAt: new Date().toISOString()
    };

    db.users.push(newUser);
    saveDB(db);

    const token = generateToken(newUser.id, newUser.role);

    return NextResponse.json({
      message: 'Registration successful',
      token,
      user: { id: newUser.id, email: newUser.email, role: newUser.role }
    }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
