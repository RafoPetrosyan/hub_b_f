import { redirect } from 'next/navigation';

export default function AccountOwnerRedirect() {
  redirect('/dashboard');
}
