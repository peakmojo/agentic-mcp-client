import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { JobStatus } from '../../../types/job';

/**
 * @swagger
 * components:
 *   schemas:
 *     JobStatus:
 *       type: object
 *       properties:
 *         jobId:
 *           type: string
 *           description: Unique identifier for the job
 *         status:
 *           type: string
 *           enum: [pending, running, completed, failed]
 *           description: Current status of the job
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the job was created
 *         startedAt:
 *           type: string
 *           format: date-time
 *           description: When the job started running
 *         completedAt:
 *           type: string
 *           format: date-time
 *           description: When the job completed or failed
 *         workdir:
 *           type: string
 *           description: Working directory for the job
 *         error:
 *           type: string
 *           description: Error message if the job failed
 *     JobSubmission:
 *       type: object
 *       required:
 *         - agent_worker_task
 *         - config
 *       properties:
 *         agent_worker_task:
 *           type: object
 *           description: Task configuration for the agent worker
 *         config:
 *           type: object
 *           description: Configuration for the job
 *         workdir:
 *           type: string
 *           description: Optional working directory for the job
 */

/**
 * @swagger
 * /jobs:
 *   get:
 *     summary: List all jobs
 *     description: Returns a list of all jobs with their current status
 *     tags:
 *       - Jobs
 *     responses:
 *       200:
 *         description: List of jobs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/JobStatus'
 *       500:
 *         description: Server error
 *   post:
 *     summary: Submit a new job
 *     description: Creates a new job with the provided task and configuration
 *     tags:
 *       - Jobs
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/JobSubmission'
 *     responses:
 *       201:
 *         description: Job created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JobStatus'
 *       400:
 *         description: Invalid request body
 *       500:
 *         description: Server error
 */

// Reference to the shared jobs store
// This is a workaround since we don't have a proper database
// In a real app, you'd use a database to store job information
declare global {
  var jobsStore: Record<string, JobStatus>;
}

if (!global.jobsStore) {
  global.jobsStore = {};
}

const jobs = global.jobsStore;

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Function to generate a UUID
function generateUUID(): string {
  return Array.from({ length: 16 }, () => 
    Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
  ).join('');
}

// Function to check if a process is still running
function isProcessRunning(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (e) {
    return false;
  }
}

// Function to update job status based on process state
function updateJobStatus(jobId: string): void {
  const job = jobs[jobId];
  
  // Only check running jobs with a PID
  if (job.status === 'running' && job.pid) {
    if (!isProcessRunning(job.pid)) {
      // Process doesn't exist anymore, assume it completed
      jobs[jobId] = {
        ...job,
        status: 'completed',
        completedAt: new Date().toISOString()
      };
    }
  }
}

// Function to run a job in a child process
function runJob(jobId: string, taskData: any, configData: any, workdir?: string) {
  const timestamp = new Date().toISOString();
  
  // Update job status to running
  jobs[jobId] = {
    ...jobs[jobId],
    status: 'running',
    startedAt: timestamp
  };
  
  // Create temporary files
  const tempDir = path.join(process.cwd(), 'temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  
  const taskFile = path.join(tempDir, `task_${jobId}.json`);
  const configFile = path.join(tempDir, `config_${jobId}.json`);
  const logFile = path.join(logsDir, `job_${jobId}.log`);
  
  // Write data to temp files
  fs.writeFileSync(taskFile, JSON.stringify(taskData, null, 2));
  fs.writeFileSync(configFile, JSON.stringify(configData, null, 2));
  
  // Determine the project root directory
  // By default, we go two levels up from the dashboard directory
  // This assumes dashboard is in the root of the project
  const defaultProjectRoot = path.resolve(process.cwd(), '..');
  
  // Use the provided workdir if available, otherwise use the default
  const projectRoot = workdir || defaultProjectRoot;
  
  // Store the working directory with the job
  jobs[jobId].workdir = projectRoot;
  
  // Run the job as a child process
  const childProcess = exec(
    `uv run agentic_mcp_client/agent_worker/run.py`,
    { 
      cwd: projectRoot, // Set the working directory to the project root
      env: { ...process.env } // Pass current environment variables
    },
    (error) => {
      if (error) {
        // Update job status to failed
        jobs[jobId] = {
          ...jobs[jobId],
          status: 'failed',
          error: error.message,
          completedAt: new Date().toISOString()
        };
      } else {
        // Update job status to completed
        jobs[jobId] = {
          ...jobs[jobId],
          status: 'completed',
          completedAt: new Date().toISOString()
        };
      }
      
      // Clean up temp files
      try {
        fs.unlinkSync(taskFile);
        fs.unlinkSync(configFile);
      } catch (err) {
        console.error('Error cleaning up temp files:', err);
      }
    }
  );
  
  // Store the process ID for later use
  if (childProcess.pid) {
    jobs[jobId].pid = childProcess.pid;
  }
  
  // Redirect output to log file
  if (childProcess.stdout && childProcess.stderr) {
    const logStream = fs.createWriteStream(logFile, { flags: 'a' });
    childProcess.stdout.pipe(logStream);
    childProcess.stderr.pipe(logStream);

    // Also log the command being run and working directory to help with debugging
    logStream.write(`[${new Date().toISOString()}] Command: python -m agentic_mcp_client.agent_worker.run\n`);
    logStream.write(`[${new Date().toISOString()}] Working directory: ${projectRoot}\n`);
    logStream.write(`[${new Date().toISOString()}] Task file: ${taskFile}\n`);
    logStream.write(`[${new Date().toISOString()}] Config file: ${configFile}\n`);
    logStream.write(`[${new Date().toISOString()}] Starting job execution...\n\n`);
  }
}

// POST /api/jobs - Submit a new job
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate the request body
    if (!body.agent_worker_task || !body.config) {
      return NextResponse.json(
        { error: 'Missing required fields: agent_worker_task and config' },
        { status: 400 }
      );
    }
    
    // Generate a unique ID for the job
    const jobId = generateUUID();
    const timestamp = new Date().toISOString();
    
    // Create a new job status entry
    jobs[jobId] = {
      jobId,
      status: 'pending',
      createdAt: timestamp
    };
    
    // Start the job in the background
    runJob(jobId, body.agent_worker_task, body.config, body.workdir);
    
    return NextResponse.json(jobs[jobId], { status: 201 });
  } catch (error) {
    console.error('Error submitting job:', error);
    return NextResponse.json(
      { error: 'Failed to submit job' },
      { status: 500 }
    );
  }
}

// GET /api/jobs - List all jobs
export async function GET() {
  try {
    // Update the status of all running jobs
    Object.keys(jobs).forEach(jobId => {
      updateJobStatus(jobId);
    });
    
    return NextResponse.json(Object.values(jobs));
  } catch (error) {
    console.error('Error listing jobs:', error);
    return NextResponse.json(
      { error: 'Failed to list jobs' },
      { status: 500 }
    );
  }
} 