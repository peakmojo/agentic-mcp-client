'use client';

import { useState, useEffect } from 'react';
import { JobStatus } from '../types/job';

export default function JobsList() {
  const [jobs, setJobs] = useState<JobStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch jobs on component mount and periodically
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch('/api/jobs');
        if (!response.ok) {
          throw new Error(`Server responded with ${response.status}`);
        }
        const data = await response.json();
        
        // Sort jobs by creation date (newest first)
        const sortedJobs = [...data].sort((a, b) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        
        setJobs(sortedJobs);
        setError(null);
      } catch (error) {
        setError(`Failed to fetch jobs: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };
    
    // Initial fetch
    fetchJobs();
    
    // Set up polling
    const interval = setInterval(fetchJobs, 5000);
    
    // Clean up
    return () => clearInterval(interval);
  }, []);
  
  // Cancel a job
  const handleCancelJob = async (jobId: string) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      
      // Update the job in the local state
      const updatedJob = await response.json();
      const updatedJobs = jobs.map(job => job.jobId === jobId ? updatedJob : job);
      
      // Re-sort to maintain order
      const sortedJobs = [...updatedJobs].sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      
      setJobs(sortedJobs);
      
    } catch (error) {
      setError(`Failed to cancel job: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  
  // Get status badge color
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
      case 'running':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100';
    }
  };
  
  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  if (loading) {
    return <div className="text-center p-8">Loading jobs...</div>;
  }
  
  if (error) {
    return (
      <div className="bg-red-100 text-red-800 p-4 rounded-md dark:bg-red-800 dark:text-red-100">
        {error}
      </div>
    );
  }
  
  if (jobs.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500 dark:text-gray-400">
        No jobs found. Submit a job to get started.
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <div key={job.jobId} className="border rounded-lg p-4 dark:border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium">{job.jobId}</h3>
              <div className="flex items-center mt-1">
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(job.status)}`}>
                  {job.status}
                </span>
                {job.pid && (
                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                    PID: {job.pid}
                  </span>
                )}
              </div>
            </div>
            
            {job.status === 'running' && (
              <button
                onClick={() => handleCancelJob(job.jobId)}
                className="text-sm px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Cancel
              </button>
            )}
          </div>
          
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Created:</span> {formatDate(job.createdAt)}
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Started:</span> {formatDate(job.startedAt)}
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Completed:</span> {formatDate(job.completedAt)}
            </div>
            {job.workdir && (
              <div className="col-span-2">
                <span className="text-gray-500 dark:text-gray-400">Working Directory:</span> 
                <span className="ml-1 font-mono text-xs break-all">{job.workdir}</span>
              </div>
            )}
          </div>
          
          {job.error && (
            <div className="mt-3 text-sm text-red-600 dark:text-red-400">
              <span className="font-medium">Error:</span> {job.error}
            </div>
          )}
          
          <div className="mt-2 text-sm">
            <a 
              href={`/api/logs/job_${job.jobId}.log`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              View Log
            </a>
          </div>
        </div>
      ))}
    </div>
  );
} 