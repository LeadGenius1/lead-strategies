import { redirect } from 'next/navigation'

/**
 * /admin redirects to dashboard; layout handles auth and redirects to /admin/login if needed.
 */
export default function AdminPage() {
  redirect('/admin/dashboard')
}
