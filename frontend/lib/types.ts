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
  category: 'support' | 'bug' | 'feature' | 'question'  // Message-level category
  created_at: string
}

export interface Ticket {
  id: string
  title: string
  category: 'support' | 'bug' | 'feature' | 'question'
  status: 'open' | 'pending' | 'in_progress' | 'resolved' | 'closed'
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

export interface TicketHistory {
  id: string
  ticket_id: string
  action: 'created' | 'status_changed' | 'title_updated' | 'message_added' | 'deleted'
  old_value: string | null
  new_value: string | null
  changed_by: string | null
  created_at: string
  metadata: Record<string, any> | null
}

export interface TicketWithMessages extends Ticket {
  messages: Message[]
}

