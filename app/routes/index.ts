import { redirect } from 'react-router';
import { getSession } from '../lib/auth';

export async function loader() {
  const session = await getSession();
  
  if (session) {
    return redirect('/dashboard');
  }
  
  return redirect('/login');
}

export default function Index() {
  return null;
} 