import { NextResponse } from 'next/server';
import { getAllSessions } from '../../../lib/sessions';

/**
 * @swagger
 * components:
 *   schemas:
 *     Session:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the session
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: When the session was created
 *         metadata:
 *           type: object
 *           description: Additional metadata about the session
 */

/**
 * @swagger
 * /sessions:
 *   get:
 *     summary: List all sessions
 *     description: Returns a list of all agent worker sessions
 *     tags:
 *       - Sessions
 *     responses:
 *       200:
 *         description: List of sessions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Session'
 *       500:
 *         description: Server error
 */
export async function GET() {
  try {
    const sessions = getAllSessions();
    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
} 