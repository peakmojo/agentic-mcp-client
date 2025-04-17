import { NextResponse } from 'next/server';
import { getSession } from '../../../../lib/sessions';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSession(params.id);
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(session);
  } catch (error) {
    console.error('Error fetching session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch session' },
      { status: 500 }
    );
  }
} 