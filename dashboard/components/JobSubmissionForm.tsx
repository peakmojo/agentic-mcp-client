'use client';

import { useState, useRef, ChangeEvent, useEffect } from 'react';
import { JobSubmission } from '../types/job';

export default function JobSubmissionForm() {
  const [agentWorkerTask, setAgentWorkerTask] = useState<Record<string, any> | null>(null);
  const [config, setConfig] = useState<Record<string, any> | null>(null);
  const [workdir, setWorkdir] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  
  // Available config files
  const [availableTaskFiles, setAvailableTaskFiles] = useState<string[]>([]);
  const [availableConfigFiles, setAvailableConfigFiles] = useState<string[]>([]);
  const [selectedTaskFile, setSelectedTaskFile] = useState<string>('');
  const [selectedConfigFile, setSelectedConfigFile] = useState<string>('');
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);
  
  // Refs for file inputs
  const agentWorkerTaskInputRef = useRef<HTMLInputElement>(null);
  const configInputRef = useRef<HTMLInputElement>(null);
  
  // Fetch available config files
  useEffect(() => {
    const fetchConfigFiles = async () => {
      try {
        setIsLoadingFiles(true);
        const response = await fetch('/api/configs');
        if (!response.ok) {
          throw new Error(`Server responded with ${response.status}`);
        }
        const data = await response.json();
        setAvailableTaskFiles(data.agentWorkerTasks || []);
        setAvailableConfigFiles(data.configFiles || []);
      } catch (error) {
        console.error('Failed to fetch config files:', error);
        setMessage({ 
          text: `Failed to load config files: ${error instanceof Error ? error.message : 'Unknown error'}`, 
          type: 'error' 
        });
      } finally {
        setIsLoadingFiles(false);
      }
    };
    
    fetchConfigFiles();
  }, []);
  
  // Load file content when selected from dropdown
  const loadFileContent = async (filename: string, type: 'task' | 'config') => {
    if (!filename) return;
    
    try {
      setMessage({ text: `Loading ${type} file...`, type: 'info' });
      const response = await fetch(`/api/configs/${filename}`);
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      
      const data = await response.json();
      
      if (type === 'task') {
        setAgentWorkerTask(data);
        setMessage({ text: 'Agent worker task loaded successfully', type: 'success' });
      } else {
        setConfig(data);
        setMessage({ text: 'Config loaded successfully', type: 'success' });
      }
    } catch (error) {
      setMessage({ 
        text: `Failed to load ${type} file: ${error instanceof Error ? error.message : 'Unknown error'}`, 
        type: 'error' 
      });
    }
  };
  
  // Handle task file selection
  const handleTaskFileChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const filename = e.target.value;
    setSelectedTaskFile(filename);
    if (filename) {
      loadFileContent(filename, 'task');
    } else {
      setAgentWorkerTask(null);
    }
  };
  
  // Handle config file selection
  const handleConfigFileChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const filename = e.target.value;
    setSelectedConfigFile(filename);
    if (filename) {
      loadFileContent(filename, 'config');
    } else {
      setConfig(null);
    }
  };
  
  // Handle file upload for agent worker task
  const handleAgentWorkerTaskUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        setAgentWorkerTask(json);
        setMessage({ text: 'Agent worker task loaded successfully', type: 'success' });
        
        // Reset dropdown selection
        setSelectedTaskFile('');
      } catch (error) {
        setMessage({ text: 'Invalid JSON file for agent worker task', type: 'error' });
      }
    };
    reader.readAsText(file);
  };
  
  // Handle file upload for config
  const handleConfigUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        setConfig(json);
        setMessage({ text: 'Config loaded successfully', type: 'success' });
        
        // Reset dropdown selection
        setSelectedConfigFile('');
      } catch (error) {
        setMessage({ text: 'Invalid JSON file for config', type: 'error' });
      }
    };
    reader.readAsText(file);
  };
  
  // Handle working directory change
  const handleWorkdirChange = (e: ChangeEvent<HTMLInputElement>) => {
    setWorkdir(e.target.value);
  };
  
  // Submit the job
  const handleSubmit = async () => {
    if (!agentWorkerTask || !config) {
      setMessage({ text: 'Please select or upload both agent worker task and config files', type: 'error' });
      return;
    }
    
    setIsSubmitting(true);
    setMessage({ text: 'Submitting job...', type: 'info' });
    
    try {
      const submission: JobSubmission = {
        agent_worker_task: agentWorkerTask,
        config: config
      };
      
      // Add working directory if specified
      if (workdir.trim()) {
        submission.workdir = workdir.trim();
      }
      
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submission),
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      
      const data = await response.json();
      setMessage({ text: `Job submitted successfully with ID: ${data.jobId}`, type: 'success' });
      
      // Reset form
      setAgentWorkerTask(null);
      setConfig(null);
      setWorkdir('');
      setSelectedTaskFile('');
      setSelectedConfigFile('');
      if (agentWorkerTaskInputRef.current) agentWorkerTaskInputRef.current.value = '';
      if (configInputRef.current) configInputRef.current.value = '';
      
    } catch (error) {
      setMessage({ text: `Failed to submit job: ${error instanceof Error ? error.message : 'Unknown error'}`, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Display JSON preview
  const renderJsonPreview = (json: Record<string, any> | null, title: string) => {
    if (!json) return null;
    
    return (
      <div className="mt-4">
        <h3 className="text-lg font-medium">{title} Preview:</h3>
        <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md overflow-auto max-h-64 text-sm mt-2">
          {JSON.stringify(json, null, 2)}
        </pre>
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      {message && (
        <div className={`p-4 rounded-md ${
          message.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' :
          message.type === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100' :
          'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
        }`}>
          {message.text}
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium mb-2">
          Agent Worker Task JSON
        </label>
        
        <div className="mb-3">
          <select 
            value={selectedTaskFile}
            onChange={handleTaskFileChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
            disabled={isLoadingFiles}
          >
            <option value="">-- Select a task file --</option>
            {availableTaskFiles.map((file) => (
              <option key={file} value={file}>{file}</option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Select a task file from the project directory or upload your own
          </p>
        </div>
        
        <div className="flex items-center">
          <span className="mr-2 text-sm text-gray-500 dark:text-gray-400">Or upload:</span>
          <input
            type="file"
            accept=".json"
            onChange={handleAgentWorkerTaskUpload}
            className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-200"
            ref={agentWorkerTaskInputRef}
          />
        </div>
        
        {renderJsonPreview(agentWorkerTask, 'Agent Worker Task')}
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">
          Config JSON
        </label>
        
        <div className="mb-3">
          <select 
            value={selectedConfigFile}
            onChange={handleConfigFileChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
            disabled={isLoadingFiles}
          >
            <option value="">-- Select a config file --</option>
            {availableConfigFiles.map((file) => (
              <option key={file} value={file}>{file}</option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Select a config file from the project directory or upload your own
          </p>
        </div>
        
        <div className="flex items-center">
          <span className="mr-2 text-sm text-gray-500 dark:text-gray-400">Or upload:</span>
          <input
            type="file"
            accept=".json"
            onChange={handleConfigUpload}
            className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-200"
            ref={configInputRef}
          />
        </div>
        
        {renderJsonPreview(config, 'Config')}
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">
          Working Directory (optional)
        </label>
        <input
          type="text"
          value={workdir}
          onChange={handleWorkdirChange}
          placeholder="e.g., /path/to/project (leave empty for default)"
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Specify the full path to your project directory. If left empty, the system will use the default location.
        </p>
      </div>
      
      <button
        onClick={handleSubmit}
        disabled={isSubmitting || !agentWorkerTask || !config}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Job'}
      </button>
    </div>
  );
} 