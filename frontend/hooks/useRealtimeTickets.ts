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
  const [allTickets, setAllTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [archivedTicketIds, setArchivedTicketIds] = useState<Set<string>>(new Set())

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

      setAllTickets(ticketsWithMessages)
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
    console.log('Setting up Realtime subscriptions...')
    
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
          console.log('✅ New ticket received!', payload.new)
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
          console.log('✅ Ticket updated!', payload.new)
          // Re-fetch to get updated messages
          fetchTickets()
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'tickets'
        },
        (payload) => {
          console.log('✅ Ticket deleted!', payload.old)
          // Remove from local state immediately
          setAllTickets(prev => prev.filter(t => t.id !== payload.old.id))
          setArchivedTicketIds(prev => {
            const newSet = new Set(prev)
            newSet.delete(payload.old.id)
            return newSet
          })
        }
      )
      .subscribe((status) => {
        console.log('Ticket channel subscription status:', status)
        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to tickets table')
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Error subscribing to tickets table')
        }
      })

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
          console.log('✅ New message received!', payload.new)
          // Re-fetch to show new message in ticket
          fetchTickets()
        }
      )
      .subscribe((status) => {
        console.log('Message channel subscription status:', status)
        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to messages table')
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Error subscribing to messages table')
        }
      })

    // Cleanup
    return () => {
      supabase.removeChannel(ticketChannel)
      supabase.removeChannel(messageChannel)
    }
  }, [fetchTickets])

  const archiveTicket = (ticketId: string) => {
    setArchivedTicketIds(prev => new Set([...prev, ticketId]))
  }

  const archiveAllTickets = () => {
    const allIds = allTickets.map(t => t.id)
    setArchivedTicketIds(prev => new Set([...prev, ...allIds]))
  }

  const restoreTicket = (ticketId: string) => {
    setArchivedTicketIds(prev => {
      const newSet = new Set(prev)
      newSet.delete(ticketId)
      return newSet
    })
  }

  const clearArchived = () => {
    setArchivedTicketIds(new Set())
    // Re-fetch to show all tickets again
    fetchTickets()
  }

  const deleteTicket = async (ticketId: string) => {
    try {
      // Delete ticket (messages will be cascade deleted)
      const { error } = await supabase
        .from('tickets')
        .delete()
        .eq('id', ticketId)
      
      if (error) throw error
      
      // Remove from local state
      setAllTickets(prev => prev.filter(t => t.id !== ticketId))
      setArchivedTicketIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(ticketId)
        return newSet
      })
    } catch (err) {
      console.error('Error deleting ticket:', err)
      throw err
    }
  }

  const deleteAllTickets = async () => {
    try {
      // Get all ticket IDs first
      const { data: allTickets, error: fetchError } = await supabase
        .from('tickets')
        .select('id')
      
      if (fetchError) throw fetchError
      
      if (!allTickets || allTickets.length === 0) {
        // Already empty
        setAllTickets([])
        setArchivedTicketIds(new Set())
        return
      }
      
      // Delete all tickets (messages will be cascade deleted)
      // Delete in batches to avoid timeout
      const batchSize = 50
      for (let i = 0; i < allTickets.length; i += batchSize) {
        const batch = allTickets.slice(i, i + batchSize)
        const ids = batch.map(t => t.id)
        
        const { error } = await supabase
          .from('tickets')
          .delete()
          .in('id', ids)
        
        if (error) throw error
      }
      
      // Clear local state
      setAllTickets([])
      setArchivedTicketIds(new Set())
    } catch (err) {
      console.error('Error deleting all tickets:', err)
      throw err
    }
  }

  // Filter out archived tickets from display
  const visibleTickets = allTickets.filter(ticket => !archivedTicketIds.has(ticket.id))

  return { 
    tickets: visibleTickets, 
    loading, 
    error, 
    refetch: fetchTickets,
    archiveTicket,
    archiveAllTickets,
    restoreTicket,
    clearArchived,
    archivedCount: archivedTicketIds.size,
    deleteTicket,
    deleteAllTickets
  }
}

