"use client";

import { Card, Title, Text } from '@tremor/react';
import { Session, Entry } from '../types/session';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useState } from 'react';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface SessionDetailProps {
  session: Session;
}

interface ToolCallInput {
  code_snippet?: string;
  [key: string]: unknown;
}

function ToolCallDisplay({ data, timestamp, role }: { 
  data: { 
    tool_name: string; 
    tool_input: ToolCallInput; 
    tool_id?: string;
  },
  timestamp: string;
  role: string;
}) {
  const [isExpanded, setIsExpanded] = useState(false); // Default to collapsed
  
  // Pretty format the code in tool_input if it's code_snippet
  const formattedInput = () => {
    if (data.tool_input && 'code_snippet' in data.tool_input && data.tool_input.code_snippet) {
      // This is code snippet
      return (
        <div className="mt-2">
          <div className="text-xs text-gray-500 mb-1">Code Snippet:</div>
          <pre className="bg-gray-50 text-gray-800 rounded-lg p-3 text-sm overflow-x-auto border border-gray-200 whitespace-pre-wrap break-words">
            {String(data.tool_input.code_snippet)}
          </pre>
        </div>
      );
    }
    
    return (
      <pre className="bg-gray-50 text-gray-800 rounded-lg p-3 text-sm overflow-x-auto border border-gray-200 whitespace-pre-wrap break-words">
        {JSON.stringify(data.tool_input, null, 2)}
      </pre>
    );
  };

  return (
    <div className="tool-call bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 py-1 flex items-center justify-between bg-gray-100 hover:bg-gray-200 transition-colors text-left"
      >
        <div className="flex items-center">
          <span className="text-sm font-medium text-gray-900">{role} / tool_call: {data.tool_name}</span>
          <span className="ml-2 text-xs text-gray-500">
            {format(new Date(timestamp), 'HH:mm:ss')}
          </span>
          {data.tool_id && (
            <span className="ml-2 text-xs text-gray-500">ID: {data.tool_id.slice(-8)}</span>
          )}
        </div>
        {isExpanded ? (
          <ChevronDownIcon className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronRightIcon className="h-4 w-4 text-gray-500" />
        )}
      </button>
      
      {isExpanded && (
        <div className="p-3 space-y-2">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-xs text-gray-500">Tool Name:</span>
              <div className="font-medium text-gray-900">{data.tool_name}</div>
            </div>
            {data.tool_id && (
              <div>
                <span className="text-xs text-gray-500">Tool ID:</span>
                <div className="font-medium text-gray-900 font-mono">{data.tool_id}</div>
              </div>
            )}
          </div>
          
          <div>
            <span className="text-xs text-gray-500">Input:</span>
            {formattedInput()}
          </div>
        </div>
      )}
    </div>
  );
}

function ToolResultDisplay({ content, timestamp }: { content: string, timestamp: string }) {
  const [isExpanded, setIsExpanded] = useState(false); // Default to collapsed
  
  return (
    <div className="tool-result bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 py-1 flex items-center justify-between bg-gray-100 hover:bg-gray-200 transition-colors text-left"
      >
        <div className="flex items-center">
          <span className="text-sm font-medium text-gray-900">Tool Result</span>
          <span className="ml-2 text-xs text-gray-500">
            {format(new Date(timestamp), 'HH:mm:ss')}
          </span>
        </div>
        {isExpanded ? (
          <ChevronDownIcon className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronRightIcon className="h-4 w-4 text-gray-500" />
        )}
      </button>
      
      {isExpanded && (
        <div className="p-3">
          <div>
            <span className="text-xs text-gray-500 mb-1">Result:</span>
            <div className="mt-1 bg-gray-50 text-gray-800 rounded-lg p-2 text-sm overflow-x-auto border border-gray-200 whitespace-pre-wrap break-words">
              {content}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CollapsibleMessage({ entry, children }: { entry: Entry; children: React.ReactNode }) {
  const [isExpanded, setIsExpanded] = useState(false); // Always collapsed by default
  
  let typeLabel = entry.entry_type as string;
  if (entry.entry_type === 'message') {
    typeLabel = entry.data.role || 'message';
  }
  if (entry.data.type) {
    typeLabel += ` / ${entry.data.type}`;
  }
  
  // Add tool name to label for tool calls
  if (entry.data.type === 'tool_call' && entry.data.tool_name) {
    typeLabel += `: ${entry.data.tool_name}`;
  }

  return (
    <div className="message-wrapper bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 py-1 flex items-center justify-between bg-gray-100 hover:bg-gray-200 transition-colors text-left"
      >
        <div className="flex items-center">
          <span className="text-sm font-medium text-gray-900">{typeLabel}</span>
          <span className="ml-2 text-xs text-gray-500">
            {format(new Date(entry.timestamp), 'HH:mm:ss')}
          </span>
        </div>
        {isExpanded ? (
          <ChevronDownIcon className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronRightIcon className="h-4 w-4 text-gray-500" />
        )}
      </button>
      
      {isExpanded && (
        <div className="p-0">
          {children}
        </div>
      )}
    </div>
  );
}

function NonCollapsibleMessage({ entry, children }: { entry: Entry; children: React.ReactNode }) {
  let typeLabel = '';
  if (entry.data.role) {
    typeLabel = entry.data.role;
  }
  
  return (
    <div className="message-wrapper overflow-hidden">
      <div className="px-3 py-1 flex items-center bg-gray-100 text-left border border-gray-200 rounded-t-lg">
        <span className="text-sm font-medium text-gray-900">{typeLabel}</span>
        <span className="ml-2 text-xs text-gray-500">
          {format(new Date(entry.timestamp), 'HH:mm:ss')}
        </span>
      </div>
      <div className="p-0">
        {children}
      </div>
    </div>
  );
}

function ThinkingDisplay({ content, timestamp }: { content: unknown, timestamp: string }) {
  const [isExpanded, setIsExpanded] = useState(false); // Default to collapsed
  
  const getThinkingContent = () => {
    if (typeof content === 'string') return content;
    
    if (Array.isArray(content) && content.length > 0 && content[0].thinking) {
      return content[0].thinking;
    }
    
    return JSON.stringify(content);
  };
  
  return (
    <div className="thinking bg-yellow-50 rounded-lg border border-yellow-200 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 py-1 flex items-center justify-between bg-yellow-100 hover:bg-yellow-200 transition-colors text-left"
      >
        <div className="flex items-center">
          <span className="text-sm font-medium text-yellow-800">Thinking</span>
          <span className="ml-2 text-xs text-gray-500">
            {format(new Date(timestamp), 'HH:mm:ss')}
          </span>
        </div>
        {isExpanded ? (
          <ChevronDownIcon className="h-4 w-4 text-yellow-600" />
        ) : (
          <ChevronRightIcon className="h-4 w-4 text-yellow-600" />
        )}
      </button>
      
      {isExpanded && (
        <div className="p-2 text-sm text-gray-700 whitespace-pre-wrap">
          {getThinkingContent()}
        </div>
      )}
    </div>
  );
}

function MessageContent({ entry }: { entry: Entry }) {
  const { data } = entry;
  
  // System events
  if (entry.entry_type === 'system_event') {
    return (
      <div className="system-event bg-gray-100 rounded-lg p-2 text-sm text-left text-gray-600">
        {data.type}: {JSON.stringify(data.details)}
      </div>
    );
  }
  
  // Thinking entries
  if (entry.entry_type === 'thinking') {
    return <ThinkingDisplay content={data.content} timestamp={entry.timestamp} />;
  }
  
  // Tool calls
  if (data.type === 'tool_call') {
    return (
      <ToolCallDisplay 
        data={{
          tool_name: data.tool_name || '',
          tool_input: data.tool_input || {},
          tool_id: data.tool_id
        }}
        timestamp={entry.timestamp}
        role={data.role || 'assistant'}
      />
    );
  }
  
  // Tool results
  if (data.type === 'tool_result') {
    return <ToolResultDisplay 
      content={typeof data.content === 'string' ? data.content : ''} 
      timestamp={entry.timestamp}
    />;
  }
  
  // Regular messages
  if (data.type === 'message' && data.content && typeof data.content === 'string') {
    const isUserMessage = data.role === 'user';
    
    return (
      <div className={`prose ${isUserMessage ? 'prose-invert' : ''} max-w-none break-words overflow-hidden`}>
        <div className="markdown">
          <div className="markdown-content overflow-auto">
            {/* @ts-expect-error - Known issue with react-markdown types */}
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {data.content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    );
  }
  
  // Fallback
  return (
    <div className="unknown-entry text-sm text-gray-500">
      Unknown entry type: {entry.entry_type} / {data.type}
    </div>
  );
}

export default function SessionDetail({ session }: SessionDetailProps) {
  const [showSystemEvents, setShowSystemEvents] = useState(false);

  return (
    <div className="max-w-5xl mx-auto bg-white min-h-screen">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <Title className="text-xl font-semibold text-gray-900">Session Details</Title>
          {session.status !== 'active' && (
            <div className={`
              px-3 py-1 rounded-full text-sm font-medium
              ${session.status === 'completed' ? 'bg-gray-100 text-gray-800' : ''}
              ${session.status === 'error' ? 'bg-red-100 text-red-800' : ''}
            `}>
              {session.status}
            </div>
          )}
        </div>
        
        <div className="mt-2 flex gap-4 text-sm text-gray-500">
          <Text>Session ID: {session.id}</Text>
          <Text>Started: {format(new Date(session.startTime), 'MMM d, yyyy HH:mm:ss')}</Text>
          {session.endTime && (
            <Text>Ended: {format(new Date(session.endTime), 'MMM d, yyyy HH:mm:ss')}</Text>
          )}
        </div>

        <div className="mt-3 flex items-center">
          <label className="inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={showSystemEvents} 
              onChange={(e) => setShowSystemEvents(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-600">Show system events</span>
          </label>
        </div>
      </div>

      <div className="px-6 py-4 space-y-3">
        {session.messages
          .filter(entry => showSystemEvents || entry.entry_type !== 'system_event')
          .map((entry, index) => {
            const isUserOrRegularMessage = entry.entry_type === 'message' && 
              (entry.data.role === 'user' || 
               (entry.data.type === 'message' && entry.data.role !== 'system'));
            
            return (
              <div
                key={index}
                className="flex justify-start"
              >
                <div className="relative group max-w-[85%]">
                  {isUserOrRegularMessage ? (
                    <NonCollapsibleMessage entry={entry}>
                      <div className={`
                        p-3 rounded-b-lg shadow-sm overflow-hidden w-full break-words
                        ${entry.data.role === 'user' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-white text-gray-900 border-x border-b border-gray-200'}
                      `}>
                        <MessageContent entry={entry} />
                      </div>
                    </NonCollapsibleMessage>
                  ) : (
                    entry.data.type === 'tool_call' || 
                    entry.data.type === 'tool_result' || 
                    entry.entry_type === 'thinking' ? (
                      <MessageContent entry={entry} />
                    ) : (
                      <CollapsibleMessage entry={entry}>
                        <div className={`
                          p-3 rounded-b-lg shadow-sm overflow-hidden w-full break-words
                          ${entry.entry_type === 'system_event'
                            ? 'bg-gray-50 text-gray-700 text-sm border-gray-100'
                            : 'bg-white text-gray-900'}
                        `}>
                          <MessageContent entry={entry} />
                        </div>
                      </CollapsibleMessage>
                    )
                  )}
                </div>
              </div>
            );
          })}
      </div>

      {session.error && (
        <div className="px-6 py-4">
          <Card className="bg-red-50 border border-red-200 shadow-sm">
            <Text className="text-red-800 font-medium">Error: {session.error}</Text>
          </Card>
        </div>
      )}
    </div>
  );
} 