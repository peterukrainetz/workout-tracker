import AppShell from '@/components/AppShell'
import Link from 'next/link'

export default function ErrorPage() {
  return (
    <div style={{
      padding: '2rem',
      display: 'flex', 
      flexDirection: 'column',
      alignSelf: 'center',
      alignItems: 'center'
    }}>
      <h1 style={{ paddingBottom: '2rem' }}>Whoops! Looks like this page does not exist.</h1>
      <Link href="/">Return to homepage</Link>
    </div>
  )
}