import { Session } from '../../../types/session';
import SessionDetail from '../../../components/SessionDetail';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

async function getSession(id: string): Promise<Session> {
  const response = await fetch(`http://localhost:3000/api/sessions/${id}`, {
    cache: 'no-store' // Disable caching to get real-time updates
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch session');
  }
  
  return response.json();
}

export default async function SessionPage({ params }: { params: { id: string } }) {
  const session = await getSession(params.id);

  return (
    <div className="space-y-6">
      <Link 
        href="/"
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeftIcon className="h-4 w-4 mr-1" />
        Back to Sessions
      </Link>
      <SessionDetail session={session} />
    </div>
  );
} 