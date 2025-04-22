import { NextResponse } from 'next/server';
import { getSession } from '../../../../lib/sessions';

/**
 * @swagger
 * /sessions/{id}:
 *   get:
 *     summary: Get session details
 *     description: Get detailed information about a specific session
 *     tags:
 *       - Sessions
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the session to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Session details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Session'
 *       404:
 *         description: Session not found
 *       500:
 *         description: Server error
 */
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