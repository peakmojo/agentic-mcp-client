import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * @swagger
 * /configs:
 *   get:
 *     summary: Get available config files
 *     description: Returns a list of agent worker tasks and config files from the project root
 *     tags:
 *       - Configurations
 *     responses:
 *       200:
 *         description: List of configuration files
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 agentWorkerTasks:
 *                   type: array
 *                   items:
 *                     type: string
 *                 configFiles:
 *                   type: array
 *                   items:
 *                     type: string
 *       500:
 *         description: Server error
 */
// GET /api/configs - Get available config files
export async function GET() {
  try {
    // Determine the project root directory (2 levels up from dashboard)
    const projectRoot = path.resolve(process.cwd(), '..');
    
    // Read the directory
    const files = fs.readdirSync(projectRoot);
    
    // Filter files to find agent worker task and config files
    const agentWorkerTasks = files.filter(file => 
      file.includes('agent_worker_task') && file.endsWith('.json')
    );
    
    const configFiles = files.filter(file => 
      file.includes('config') && file.endsWith('.json') && 
      !file.includes('agent_worker')
    );
    
    return NextResponse.json({
      agentWorkerTasks,
      configFiles
    });
  } catch (error) {
    console.error('Error fetching config files:', error);
    return NextResponse.json(
      { error: 'Failed to list config files' },
      { status: 500 }
    );
  }
} 