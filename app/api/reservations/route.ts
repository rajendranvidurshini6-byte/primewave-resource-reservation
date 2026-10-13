import { NextResponse } from 'next/server';
import { and } from '@prisma/orm-postgres/orm-client';
import { db } from '../../../src/prisma/db';

export async function GET() {
  try {
    const [resources, users, reservations] = await Promise.all([
      db.orm.public.Resource.where({}).all(),
      db.orm.public.User.where({}).all(),
      db.orm.public.Reservation.where({}).all(),
    ]);

    return NextResponse.json({
      resources,
      users,
      reservations,
    });
  } catch (error) {
    console.error('Failed to load reservation data:', error);

    return NextResponse.json(
      { error: 'Unable to load reservation data' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { startTime, endTime, userId, resourceId } = body;

    if (!startTime || !endTime || !userId || !resourceId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      return NextResponse.json(
        { error: 'Invalid date or time format' },
        { status: 400 }
      );
    }

    if (start >= end) {
      return NextResponse.json(
        { error: 'End time must be after the start time' },
        { status: 400 }
      );
    }

    const numericUserId = Number(userId);
    const numericResourceId = Number(resourceId);

    if (
      !Number.isInteger(numericUserId) ||
      !Number.isInteger(numericResourceId)
    ) {
      return NextResponse.json(
        { error: 'Invalid user or resource ID' },
        { status: 400 }
      );
    }

    const resource = await db.orm.public.Resource
      .where({ id: numericResourceId })
      .first();

    if (!resource) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      );
    }

    const user = await db.orm.public.User
      .where({ id: numericUserId })
      .first();

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const startValue = start.toISOString() as any;
    const endValue = end.toISOString() as any;

    const conflict = await db.orm.public.Reservation
      .where({ resourceId: numericResourceId })
      .where((r) =>
        and(
          r.startTime.lt(endValue),
          r.endTime.gt(startValue)
        )
      )
      .first();

    if (conflict) {
      return NextResponse.json(
        {
          error: 'Resource is already reserved during this time.',
          conflict: {
            reservationId: conflict.id,
            startTime: conflict.startTime,
            endTime: conflict.endTime,
          },
        },
        { status: 409 }
      );
    }

    const reservation =
      await db.orm.public.Reservation.create({
        startTime: startValue,
        endTime: endValue,
        userId: numericUserId,
        resourceId: numericResourceId,
      });

    return NextResponse.json(
      {
        message: 'Reservation created successfully',
        reservation,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Reservation creation failed:', error);

    return NextResponse.json(
      { error: 'Unable to create reservation' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const {
      id,
      startTime,
      endTime,
      userId,
      resourceId,
    } = body;

    const reservationId = Number(id);
    const numericUserId = Number(userId);
    const numericResourceId = Number(resourceId);

    if (
      !Number.isInteger(reservationId) ||
      !Number.isInteger(numericUserId) ||
      !Number.isInteger(numericResourceId) ||
      !startTime ||
      !endTime
    ) {
      return NextResponse.json(
        { error: 'Invalid reservation data' },
        { status: 400 }
      );
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      return NextResponse.json(
        { error: 'Invalid date or time format' },
        { status: 400 }
      );
    }

    if (start >= end) {
      return NextResponse.json(
        { error: 'End time must be after the start time' },
        { status: 400 }
      );
    }

    const existingReservation =
      await db.orm.public.Reservation
        .where({ id: reservationId })
        .first();

    if (!existingReservation) {
      return NextResponse.json(
        { error: 'Reservation not found' },
        { status: 404 }
      );
    }

    const resource = await db.orm.public.Resource
      .where({ id: numericResourceId })
      .first();

    if (!resource) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      );
    }

    const user = await db.orm.public.User
      .where({ id: numericUserId })
      .first();

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const startValue = start.toISOString() as any;
    const endValue = end.toISOString() as any;

    const conflict = await db.orm.public.Reservation
      .where({ resourceId: numericResourceId })
      .where((r) =>
        and(
          r.startTime.lt(endValue),
          r.endTime.gt(startValue)
        )
      )
      .first();

    if (conflict && conflict.id !== reservationId) {
      return NextResponse.json(
        {
          error: 'Resource is already reserved during this time.',
          conflict: {
            reservationId: conflict.id,
            startTime: conflict.startTime,
            endTime: conflict.endTime,
          },
        },
        { status: 409 }
      );
    }

    const updatedReservation =
      await db.orm.public.Reservation
        .where({ id: reservationId })
        .update({
          startTime: startValue,
          endTime: endValue,
          userId: numericUserId,
          resourceId: numericResourceId,
        });

    return NextResponse.json({
      message: 'Reservation updated successfully',
      reservation: updatedReservation,
    });
  } catch (error) {
    console.error('Reservation update failed:', error);

    return NextResponse.json(
      { error: 'Unable to update reservation' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();

    const reservationId = Number(body.id);

    if (!Number.isInteger(reservationId)) {
      return NextResponse.json(
        { error: 'Invalid reservation ID' },
        { status: 400 }
      );
    }

    const reservation = await db.orm.public.Reservation
      .where({ id: reservationId })
      .first();

    if (!reservation) {
      return NextResponse.json(
        { error: 'Reservation not found' },
        { status: 404 }
      );
    }

    await db.orm.public.Reservation
      .where({ id: reservationId })
      .delete();

    return NextResponse.json({
      message: 'Reservation deleted successfully',
    });
  } catch (error) {
    console.error('Reservation deletion failed:', error);

    return NextResponse.json(
      { error: 'Unable to delete reservation' },
      { status: 500 }
    );
  }
}