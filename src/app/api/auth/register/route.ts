import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/db';

const registerSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
    name: z
        .string()
        .min(2, 'Name must be at least 2 characters')
        .max(50, 'Name must be at most 50 characters'),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const result = registerSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { error: 'Validation failed', issues: result.error.issues },
                { status: 400 }
            );
        }

        const { email, password, name } = result.data;

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'Email already registered' },
                { status: 409 }
            );
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                passwordHash,
                name,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
            },
        });

        return NextResponse.json({ user }, { status: 201 });
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
