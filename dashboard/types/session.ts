export interface Entry {
  entry_type: 'message' | 'thinking' | 'system_event';
  timestamp: string;
  data: {
    timestamp: string;
    role: string;
    type?: string;
    content?: string | { thinking?: string }[] | Record<string, unknown>;
    tool_name?: string;
    tool_input?: Record<string, unknown>;
    tool_id?: string;
    details?: unknown;
  };
}

export interface Session {
  id: string;
  status: 'active' | 'completed' | 'error';
  startTime: string;
  endTime?: string;
  messages: Entry[];
  error?: string;
} 