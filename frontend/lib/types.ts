/**
 * TypeScript types for the application
 */

export interface Message {
  id: string
  ticket_id: string
  slack_message_id: string
  text: string
  user_id: string
  user_name: string
  channel_id: string
  thread_ts: string | null
  message_ts: string
  created_at: string
}

export interface Ticket {
  id: string
  title: string
  category: 'support' | 'bug' | 'feature' | 'question'
  status: 'open' | 'closed' | 'in_progress'
  channel_id: string
  channel_name: string | null
  first_message_ts: string
  message_count: number
  last_user_id: string | null
  last_user_name: string | null
  created_at: string
  updated_at: string
  messages?: Message[]
}

export interface TicketWithMessages extends Ticket {
  messages: Message[]
}

