// app/api/verify/route.js
import { NextResponse } from 'next/server';
import getConnection from '../../../database/db';

export async function GET() {
  try {
    const connection = await getConnection();
    try {
      const [rows] = await connection.query(
        'SELECT id, name, court, date, slot_timings, cost, verified FROM bookings'
      );
      return NextResponse.json(rows, { status: 200 });
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { id, action } = await request.json();
    if (!id || !action) {
      return NextResponse.json({ error: 'Booking ID and action are required' }, { status: 400 });
    }

    const connection = await getConnection();
    try {
      if (action === 'verify') {
        const [result] = await connection.query(
          'UPDATE bookings SET verified = TRUE WHERE id = ?',
          [id]
        );
        if (result.affectedRows === 0) {
          return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }
        return NextResponse.json({ message: 'Booking verified successfully' }, { status: 200 });
      } else if (action === 'cancel') {
        const [result] = await connection.query('DELETE FROM bookings WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
          return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }
        return NextResponse.json({ message: 'Booking cancelled successfully' }, { status: 200 });
      } else {
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
      }
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error('Error processing action:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}