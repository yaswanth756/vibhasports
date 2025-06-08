// app/api/bookings/route.js
import { NextResponse } from 'next/server';
import getConnection from '../../../database/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  const court = searchParams.get('court');

  if (!date || !court) {
    return NextResponse.json({ error: 'Date and court are required' }, { status: 400 });
  }

  try {
    const connection = await getConnection();
    try {
      const [rows] = await connection.query(
        'SELECT slot_timings FROM bookings WHERE date = ? AND court = ?',
        [date, court]
      );
      const bookedSlots = rows.map((row) => row.slot_timings);
      return NextResponse.json(bookedSlots, { status: 200 });
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error('Error fetching booked slots:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { name, court, date, slots } = await request.json();

    if (!name || !court || !date || !slots || !Array.isArray(slots) || slots.length === 0) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const connection = await getConnection();
    try {
      for (const slot of slots) {
        await connection.query(
          'INSERT INTO bookings (name, court, date, slot_timings, cost, verified) VALUES (?, ?, ?, ?, ?, ?)',
          [name, court, date, slot, 500, false]
        );
      }
      return NextResponse.json({ message: 'Bookings created successfully' }, { status: 201 });
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error('Error creating bookings:', error);
    return NextResponse.json({ error: 'Failed to create bookings' }, { status: 500 });
  }
}