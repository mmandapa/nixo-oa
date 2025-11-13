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
  const [hasNewUpdate, setHasNewUpdate] = useState(false)

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
        async (payload) => {
          console.log('✅ New ticket received!', payload.new)
          const newTicket = payload.new as any
          
          // Fetch messages for the new ticket
          const { data: messages } = await supabase
            .from('messages')
            .select('*')
            .eq('ticket_id', newTicket.id)
            .order('created_at', { ascending: true })
          
          // Add new ticket to state immediately (no loading)
          setAllTickets(prev => {
            // Check if ticket already exists (avoid duplicates)
            if (prev.some(t => t.id === newTicket.id)) {
              return prev
            }
            return [{ ...newTicket, messages: messages || [] }, ...prev]
          })
          
          // Show notification indicator
          setHasNewUpdate(true)
          setTimeout(() => setHasNewUpdate(false), 3000) // Auto-hide after 3s
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tickets'
        },
        async (payload) => {
          console.log('✅ Ticket updated!', payload.new)
          const updatedTicket = payload.new as any
          
          // Fetch messages for the updated ticket
          const { data: messages } = await supabase
            .from('messages')
            .select('*')
            .eq('ticket_id', updatedTicket.id)
            .order('created_at', { ascending: true })
          
          // Update ticket in state immediately (no loading)
          // Move updated ticket to the top since it's the most recent
          setAllTickets(prev => {
            const otherTickets = prev.filter(t => t.id !== updatedTicket.id)
            return [{ ...updatedTicket, messages: messages || [] }, ...otherTickets]
          })
          
          // Show notification indicator
          setHasNewUpdate(true)
          setTimeout(() => setHasNewUpdate(false), 3000)
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
        async (payload) => {
          console.log('✅ New message received!', payload.new)
          const newMessage = payload.new as Message
          
          // Update ticket in state immediately by adding the new message
          // Move ticket to top since it has new activity
          setAllTickets(prev => {
            let updatedTicket: Ticket | null = null
            const otherTickets = prev.filter(ticket => {
              if (ticket.id === newMessage.ticket_id) {
                // Check if message already exists (avoid duplicates)
                const messageExists = ticket.messages?.some(m => m.id === newMessage.id)
                if (messageExists) {
                  return true // Keep in place if duplicate
                }
                
                // Add new message and update message count
                updatedTicket = {
                  ...ticket,
                  messages: [...(ticket.messages || []), newMessage].sort((a, b) => 
                    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                  ),
                  message_count: (ticket.message_count || 0) + 1,
                  updated_at: new Date().toISOString()
                }
                return false // Remove from current position
              }
              return true
            })
            
            // If ticket was updated, move it to the top
            if (updatedTicket) {
              return [updatedTicket, ...otherTickets]
            }
            return otherTickets
          })
          
          // Show notification indicator
          setHasNewUpdate(true)
          setTimeout(() => setHasNewUpdate(false), 3000)
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

  const updateTicketStatus = async (ticketId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('tickets')
        .update({ status: newStatus })
        .eq('id', ticketId)
      
      if (error) throw error
      
      // Update local state
      setAllTickets(prev => prev.map(t => 
        t.id === ticketId ? { ...t, status: newStatus as any } : t
      ))
    } catch (err) {
      console.error('Error updating ticket status:', err)
      throw err
    }
  }

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
    deleteAllTickets,
    updateTicketStatus,
    hasNewUpdate
  }
}

