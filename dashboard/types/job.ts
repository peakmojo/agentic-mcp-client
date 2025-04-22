// Job submission request type
export interface JobSubmission {
  agent_worker_task: Record<string, any>;
  config: Record<string, any>;
  workdir?: string; // Optional working directory
}

// Job status response type
export interface JobStatus {
  jobId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  error?: string;
  pid?: number;
  workdir?: string; // Store the working directory used
} 