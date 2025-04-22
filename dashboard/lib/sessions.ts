import fs from 'fs';
import path from 'path';
import { Session } from '../types/session';

const LOGS_DIR = path.join(process.cwd(), '..', 'logs', 'customer');

export function getSessionData(filePath: string): Session {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const lines = fileContent.split('\n').filter(Boolean);
  const messages = [];
  let metadata;
  let error;

  for (const line of lines) {
    try {
      const entry = JSON.parse(line);
      
      if (entry.type === 'metadata') {
        metadata = entry;
      } else if (entry.entry_type === 'message' || entry.entry_type === 'thinking' || entry.entry_type === 'system_event') {
        // Preserve the original structure
        messages.push(entry);
        
        // Track errors for session status
        if (entry.entry_type === 'system_event' && entry.data?.type === 'error') {
          error = entry.data.details?.message || JSON.stringify(entry.data.details);
        }
      }
    } catch (e) {
      console.error('Error parsing line:', e);
    }
  }

  if (!metadata) {
    throw new Error('No metadata found in session file');
  }

  // Determine session status
  let status: 'active' | 'completed' | 'error' = 'active';
  if (error) {
    status = 'error';
  } else if (messages.some(msg => 
    msg.entry_type === 'system_event' && 
    msg.data?.type === 'completed'
  )) {
    status = 'completed';
  }

  return {
    id: metadata.session_id,
    status,
    startTime: metadata.start_time,
    endTime: messages.length > 0 ? messages[messages.length - 1].timestamp : undefined,
    messages,
    error
  };
}

export function getAllSessions(): Session[] {
  try {
    if (!fs.existsSync(LOGS_DIR)) {
      console.warn('Logs directory not found:', LOGS_DIR);
      return [];
    }

    const files = fs.readdirSync(LOGS_DIR)
      .filter(file => file.startsWith('session_') && file.endsWith('.jsonl'));

    const sessions = files
      .map(file => {
        try {
          return getSessionData(path.join(LOGS_DIR, file));
        } catch (e) {
          console.error('Error reading session file:', file, e);
          return null;
        }
      })
      .filter((session): session is Session => session !== null);

    // Sort by start time (newest first)
    return sessions.sort((a, b) => 
      new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );
  } catch (e) {
    console.error('Error reading sessions:', e);
    return [];
  }
}

export function getSession(sessionId: string): Session | null {
  try {
    if (!fs.existsSync(LOGS_DIR)) {
      console.warn('Logs directory not found:', LOGS_DIR);
      return null;
    }

    const files = fs.readdirSync(LOGS_DIR)
      .filter(file => file.includes(sessionId) && file.endsWith('.jsonl'));

    if (files.length === 0) {
      return null;
    }

    return getSessionData(path.join(LOGS_DIR, files[0]));
  } catch (e) {
    console.error('Error reading session:', e);
    return null;
  }
} 