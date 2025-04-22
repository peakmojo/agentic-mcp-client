import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { JobStatus } from '../../../../types/job';

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
  if (job && job.status === 'running' && job.pid) {
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

// GET /api/jobs/[jobId] - Get a specific job's status
export async function GET(
  request: Request,
  { params }: { params: { jobId: string } }
) {
  try {
    const { jobId } = params;
    
    if (!jobs[jobId]) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }
    
    // Update the job status if it's running
    updateJobStatus(jobId);
    
    return NextResponse.json(jobs[jobId]);
  } catch (error) {
    console.error(`Error getting job ${params.jobId}:`, error);
    return NextResponse.json(
      { error: 'Failed to get job status' },
      { status: 500 }
    );
  }
}

// DELETE /api/jobs/[jobId] - Cancel a job
export async function DELETE(
  request: Request,
  { params }: { params: { jobId: string } }
) {
  try {
    const { jobId } = params;
    
    if (!jobs[jobId]) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }
    
    // Only try to cancel if job is running and has a PID
    if (jobs[jobId].status === 'running' && jobs[jobId].pid) {
      try {
        // Try to terminate the process
        process.kill(jobs[jobId].pid);
        
        // Update job status
        jobs[jobId] = {
          ...jobs[jobId],
          status: 'cancelled',
          completedAt: new Date().toISOString()
        };
      } catch (e) {
        // Process might not exist anymore
        updateJobStatus(jobId);
      }
    }
    
    return NextResponse.json(jobs[jobId]);
  } catch (error) {
    console.error(`Error cancelling job ${params.jobId}:`, error);
    return NextResponse.json(
      { error: 'Failed to cancel job' },
      { status: 500 }
    );
  }
} 