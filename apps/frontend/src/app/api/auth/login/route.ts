import { NextResponse } from 'next/server';
import { getDB, hashPassword, generateToken } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const db = getDB();
    const user = db.users.find((u: any) => u.email === email);

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const hashedInput = hashPassword(password);
    if (user.password !== hashedInput) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = generateToken(user.id, user.role);

    return NextResponse.json({
      message: 'Login successful',
      token,
      user: { id: user.id, email: user.email, role: user.role }
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
