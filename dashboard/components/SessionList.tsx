import { Title, Text } from '@tremor/react';
import { Session } from '../types/session';
import { format } from 'date-fns';
import Link from 'next/link';
import { 
  CalendarIcon, 
  ChatBubbleLeftRightIcon, 
  CheckCircleIcon, 
  ExclamationCircleIcon, 
  ArrowRightIcon 
} from '@heroicons/react/24/outline';

interface SessionListProps {
  sessions: Session[];
}

// Theme colors
const THEME = {
  primary: 'indigo',
  secondary: 'violet',
  accent: 'fuchsia',
  neutral: 'slate'
};

// Get the first user message from the session
const getFirstUserMessage = (session: Session): string => {
  const userMessage = session.messages.find(
    msg => msg.entry_type === 'message' && msg.data.role === 'user'
  );
  return userMessage?.data.content as string || 'No user message';
};

// Get the last assistant message or tool call
const getLastAssistantResponse = (session: Session): { text: string, isToolCall: boolean } => {
  // Find all assistant messages (regular messages or tool calls)
  const assistantMessages = session.messages.filter(
    msg => msg.entry_type === 'message' && 
          (msg.data.role === 'assistant' || msg.data.tool_name)
  );
  
  if (assistantMessages.length === 0) {
    return { text: 'No assistant response', isToolCall: false };
  }
  
  const lastMessage = assistantMessages[assistantMessages.length - 1];
  
  // Check if it's a tool call
  if (lastMessage.data.tool_name) {
    return { 
      text: `Tool: ${lastMessage.data.tool_name}`, 
      isToolCall: true 
    };
  }
  
  // Regular message
  return { 
    text: lastMessage.data.content as string || 'Empty response', 
    isToolCall: false 
  };
};

export default function SessionList({ sessions }: SessionListProps) {
  const sortedSessions = [...sessions].sort((a, b) => {
    // Sort by start time (newest first)
    return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
  });

  return (
    <div className={`max-w-5xl mx-auto px-4 py-8 bg-gradient-to-br from-${THEME.primary}-50 to-${THEME.secondary}-50 rounded-xl`}>
      <div className="flex items-center justify-between mb-8">
        <Title className={`text-2xl font-bold text-${THEME.primary}-800`}>Sessions</Title>
        <div className={`text-sm text-${THEME.neutral}-500 bg-white px-3 py-1.5 rounded-full shadow-sm`}>
          {sortedSessions.length} sessions found
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        {sortedSessions.map((session) => (
          <Link href={`/session/${session.id}`} key={session.id} className="block group">
            <div className={`bg-white rounded-xl shadow-sm transition-all duration-300 overflow-hidden border 
              ${session.status === 'active' ? `border-${THEME.primary}-200` : 'border-gray-100'} 
              group-hover:border-${THEME.primary}-300 group-hover:shadow-md 
              group-hover:translate-y-[-2px] group-hover:scale-[1.01]`}>
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  {/* Left side - Session info */}
                  <div className="mb-4 md:mb-0">
                    <div className="flex items-center space-x-1 mb-1">
                      <span className={`w-2 h-2 rounded-full ${
                        session.status === 'completed' ? 'bg-green-500' : 
                        session.status === 'error' ? 'bg-red-500' : `bg-${THEME.primary}-500`
                      } group-hover:animate-pulse`}></span>
                      <Text className="text-xs uppercase tracking-wider font-medium text-gray-500">
                        {session.status}
                      </Text>
                    </div>
                    <Text className={`font-medium text-${THEME.primary}-800 text-lg mb-2 group-hover:text-${THEME.primary}-700`}>
                      Session {session.id.substring(0, 8)}...
                    </Text>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center text-sm space-y-1 sm:space-y-0 sm:space-x-4 text-gray-500">
                      <div className="flex items-center">
                        <CalendarIcon className={`h-4 w-4 mr-1 text-gray-400 group-hover:text-${THEME.primary}-400`} />
                        <span>{format(new Date(session.startTime), 'MMM d, HH:mm')}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <ChatBubbleLeftRightIcon className={`h-4 w-4 mr-1 text-gray-400 group-hover:text-${THEME.primary}-400`} />
                        <span>{session.messages.length} messages</span>
                      </div>
                      
                      {session.status === 'completed' && (
                        <div className="flex items-center">
                          <CheckCircleIcon className="h-4 w-4 mr-1 text-green-500" />
                          <span>Completed</span>
                        </div>
                      )}
                      
                      {session.status === 'error' && (
                        <div className="flex items-center">
                          <ExclamationCircleIcon className="h-4 w-4 mr-1 text-red-500" />
                          <span>Error</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Right side - Status/View icon */}
                  <div className="flex items-center">
                    <div className={`bg-${THEME.primary}-50 p-2 rounded-full group-hover:bg-${THEME.primary}-100 
                      transition-colors transform group-hover:scale-110 duration-300`}>
                      <ArrowRightIcon className={`h-4 w-4 text-${THEME.primary}-400 group-hover:text-${THEME.primary}-600 
                        transition-colors group-hover:translate-x-[2px]`} />
                    </div>
                  </div>
                </div>
                
                {/* Message preview section */}
                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* First user message */}
                  <div className={`bg-${THEME.neutral}-50 rounded-lg p-4 border border-${THEME.neutral}-100 
                    group-hover:border-${THEME.primary}-100 group-hover:bg-${THEME.neutral}-100/50 transition-colors`}>
                    <div className="flex items-center mb-2">
                      <div className={`w-6 h-6 rounded-full bg-${THEME.primary}-100 flex items-center justify-center mr-2 
                        group-hover:bg-${THEME.primary}-200 transition-colors`}>
                        <span className={`text-xs font-medium text-${THEME.primary}-600`}>U</span>
                      </div>
                      <Text className={`text-xs font-medium text-${THEME.neutral}-700`}>First user message</Text>
                    </div>
                    <Text className={`text-sm text-${THEME.neutral}-600 line-clamp-2`}>
                      {getFirstUserMessage(session)}
                    </Text>
                  </div>
                  
                  {/* Last assistant response */}
                  <div className={`bg-${THEME.neutral}-50 rounded-lg p-4 border border-${THEME.neutral}-100 
                    group-hover:border-${THEME.secondary}-100 group-hover:bg-${THEME.neutral}-100/50 transition-colors`}>
                    <div className="flex items-center mb-2">
                      <div className={`w-6 h-6 rounded-full bg-${THEME.secondary}-100 flex items-center justify-center mr-2 
                        group-hover:bg-${THEME.secondary}-200 transition-colors`}>
                        <span className={`text-xs font-medium text-${THEME.secondary}-600`}>A</span>
                      </div>
                      <Text className={`text-xs font-medium text-${THEME.neutral}-700`}>Last assistant response</Text>
                    </div>
                    <Text className={`text-sm text-${THEME.neutral}-600 line-clamp-2 ${getLastAssistantResponse(session).isToolCall ? 'italic' : ''}`}>
                      {getLastAssistantResponse(session).text}
                    </Text>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      {sortedSessions.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <Text className={`text-${THEME.neutral}-500`}>No sessions found</Text>
        </div>
      )}
    </div>
  );
} 