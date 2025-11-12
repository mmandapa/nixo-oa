/**
 * Custom hook for Supabase Realtime subscriptions
 * 
 * Subscribes to:
 * - New tickets (INSERT on tickets table)
 * - Updated tickets (UPDATE on tickets table)
 * - New messages (INSERT on messages table)
 */
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Ticket, Message } from '@/lib/types'

export function useRealtimeTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true)
      console.log('Fetching tickets from Supabase...')
      console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...')
      
      // Add timeout - simplified query first
      const queryPromise = supabase
        .from('tickets')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(100)

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout after 10 seconds')), 10000)
      )

      const { data, error: fetchError } = await Promise.race([queryPromise, timeoutPromise]) as any

      if (fetchError) {
        console.error('Supabase error:', fetchError)
        throw fetchError
      }

      console.log(`Fetched ${data?.length || 0} tickets`)

      // If no tickets, skip message fetching
      if (!data || data.length === 0) {
        setTickets([])
        setLoading(false)
        setError(null)
        return
      }

      // Fetch messages separately for each ticket (more reliable)
      const ticketsWithMessages = await Promise.all(
        data.map(async (ticket: any) => {
          const { data: messages } = await supabase
            .from('messages')
            .select('*')
            .eq('ticket_id', ticket.id)
            .order('created_at', { ascending: true })
          
          return {
            ...ticket,
            messages: messages || []
          }
        })
      )

      setTickets(ticketsWithMessages)
      setLoading(false)
      setError(null)
    } catch (err) {
      console.error('Error fetching tickets:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Initial fetch
    fetchTickets()

    // Subscribe to realtime changes
    const ticketChannel = supabase
      .channel('tickets-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'tickets'
        },
        (payload) => {
          console.log('New ticket!', payload.new)
          // Fetch updated list to get messages
          fetchTickets()
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tickets'
        },
        (payload) => {
          console.log('Ticket updated!', payload.new)
          // Re-fetch to get updated messages
          fetchTickets()
        }
      )
      .subscribe()

    const messageChannel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          console.log('New message!', payload.new)
          // Re-fetch to show new message in ticket
          fetchTickets()
        }
      )
      .subscribe()

    // Cleanup
    return () => {
      supabase.removeChannel(ticketChannel)
      supabase.removeChannel(messageChannel)
    }
  }, [fetchTickets])

  return { tickets, loading, error, refetch: fetchTickets }
}

