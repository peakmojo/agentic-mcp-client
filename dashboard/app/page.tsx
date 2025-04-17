import SessionList from '../components/SessionList';
import { Session } from '../types/session';

async function getSessions(): Promise<Session[]> {
  try {
    const response = await fetch('http://localhost:3000/api/sessions', {
      cache: 'no-store' // Disable caching to get real-time updates
    });
    if (!response.ok) {
      throw new Error('Failed to fetch sessions');
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return [];
  }
}

export default async function Home() {
  const sessions = await getSessions();

  return (
    <div>
      <SessionList sessions={sessions} />
    </div>
  );
} 