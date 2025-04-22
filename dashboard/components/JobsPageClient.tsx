'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Use dynamic imports in this client component
const JobSubmissionForm = dynamic(() => import('./JobSubmissionForm'), {
  ssr: false,
  loading: () => <div className="p-8 text-center">Loading job submission form...</div>
});

const JobsList = dynamic(() => import('./JobsList'), {
  ssr: false,
  loading: () => <div className="p-8 text-center">Loading jobs list...</div>
});

export default function JobsPageClient() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Job Management</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4">Submit New Job</h2>
          <JobSubmissionForm />
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4">Current Jobs</h2>
          <JobsList />
        </div>
      </div>
    </div>
  );
} 