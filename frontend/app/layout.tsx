import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FDE Dashboard - Customer Message Tracker',
  description: 'Real-time dashboard for Forward-Deployed Engineers',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

