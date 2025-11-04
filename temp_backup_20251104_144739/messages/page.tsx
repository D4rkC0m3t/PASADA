'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, Send, Paperclip, Search, MoreVertical, CheckCheck, Check, User, Users,
  MessageSquare
} from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'
import { ClientLayout } from '@/app/components/ClientLayout'

interface Message {
  id: string
  content: string
  sender_type: 'client' | 'staff' | 'admin'
  created_at: string
  read_at: string | null
  user_profiles: {
    full_name: string
    role: string
  } | null
}

interface Thread {
  id: string
  subject: string
  project_id: string | null
  last_message_at: string
  unread_count: number
  projects: {
    name: string
  } | null
}

export default function ClientMessagesPage() {
  const [threads, setThreads] = useState<Thread[]>([])
  const [selectedThread, setSelectedThread] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createBrowserClient()

  useEffect(() => {
    fetchThreads()
  }, [])

  useEffect(() => {
    if (selectedThread) {
      fetchMessages(selectedThread)
      markThreadAsRead(selectedThread)
    }
  }, [selectedThread])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchThreads = async () => {
    try {
      setLoading(true)
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get client by email
      const { error: clientError } = await supabase
        .from('clients')
        .select('id')
        .eq('email', user.email)
        .single()

      if (clientError) {
        console.error('Client not found:', clientError)
        return
      }

      // For now, using mock data since message_threads table doesn't exist yet
      // In production, this would fetch from a real message_threads table
      // TODO: Fetch actual threads when message_threads table is created
      setThreads([])
    } catch (error) {
      console.error('Error fetching threads:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (_threadId: string) => {
    try {
      // TODO: Fetch messages when messages table is created
      // const { data } = await supabase.from('messages').select('*').eq('thread_id', threadId)
      setMessages([])
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const markThreadAsRead = async (_threadId: string) => {
    // TODO: Mark all messages in thread as read
    // await supabase.from('messages').update({ read_at: new Date() }).eq('thread_id', threadId)
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedThread) return

    setSending(true)
    try {
      // Implementation pending - would insert into messages table
      setNewMessage('')
      scrollToBottom()
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message. Please try again.')
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = now.getTime() - date.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    } else if (diffDays === 1) {
      return 'Yesterday'
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' })
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  const formatMessageTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <ClientLayout 
      title="Messages" 
      subtitle="Communicate with the PASADA team"
    >
      {/* Back Button */}
      <div className="mb-6">
        <Link
          href="/client/dashboard"
          className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>
      </div>
      
      <div className="flex h-[calc(100vh-200px)] overflow-hidden bg-[#050d14] rounded-xl border border-blue-500/10 shadow-lg">
        {/* Thread List */}
        <div className="w-96 border-r border-blue-500/10 flex flex-col">

            {/* Search */}
            <div className="p-4 border-b border-blue-500/10">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#081624] border border-blue-500/20 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Threads */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                </div>
              ) : threads.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <MessageSquare className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-white mb-2">No Messages Yet</h3>
                  <p className="text-zinc-400 text-sm">
                    Your conversations will appear here
                  </p>
                </div>
              ) : (
                threads.map((thread) => (
                  <button
                    key={thread.id}
                    onClick={() => setSelectedThread(thread.id)}
                    className={`w-full p-4 border-b border-blue-500/10 hover:bg-[#081624] transition-all text-left ${
                      selectedThread === thread.id ? 'bg-[#081624] border-l-4 border-l-blue-600' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-medium truncate">{thread.subject}</h4>
                          {thread.projects && (
                            <p className="text-zinc-500 text-xs truncate">{thread.projects.name}</p>
                          )}
                        </div>
                      </div>
                      {thread.unread_count > 0 && (
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                          {thread.unread_count}
                        </span>
                      )}
                    </div>
                    <div className="text-zinc-400 text-sm">
                      {formatDate(thread.last_message_at)}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Message Area */}
          <div className="flex-1 flex flex-col bg-[#050d14]">
            {selectedThread ? (
              <>
                {/* Messages Header */}
                <div className="p-4 border-b border-blue-500/10 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium">
                        {threads.find(t => t.id === selectedThread)?.subject}
                      </h3>
                      <p className="text-zinc-500 text-sm">PASADA Team</p>
                    </div>
                  </div>
                  <button className="text-zinc-400 hover:text-white p-2">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageSquare className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                      <p className="text-zinc-400">No messages in this conversation yet</p>
                      <p className="text-zinc-500 text-sm mt-2">Start the conversation below</p>
                    </div>
                  ) : (
                    messages.map((message) => {
                      const isClientMessage = message.sender_type === 'client'
                      
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isClientMessage ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-2xl ${isClientMessage ? 'order-2' : 'order-1'}`}>
                            <div className={`flex items-start space-x-2 ${isClientMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
                              {!isClientMessage && (
                                <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center flex-shrink-0">
                                  <User className="w-4 h-4 text-zinc-400" />
                                </div>
                              )}
                              <div className={`flex-1 ${isClientMessage ? 'text-right' : 'text-left'}`}>
                                {!isClientMessage && message.user_profiles && (
                                  <div className="text-xs text-zinc-500 mb-1">
                                    {message.user_profiles.full_name}
                                  </div>
                                )}
                                <div
                                  className={`inline-block rounded-lg px-4 py-2 ${
                                    isClientMessage
                                      ? 'bg-blue-600 text-white'
                                      : 'bg-[#081624] text-white'
                                  }`}
                                >
                                  <p className="whitespace-pre-wrap">{message.content}</p>
                                </div>
                                <div className="flex items-center space-x-1 mt-1 text-xs text-zinc-500">
                                  <span>{formatMessageTime(message.created_at)}</span>
                                  {isClientMessage && (
                                    message.read_at ? (
                                      <CheckCheck className="w-3 h-3 text-blue-400" />
                                    ) : (
                                      <Check className="w-3 h-3" />
                                    )
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-blue-500/10">
                  <div className="flex items-end space-x-3">
                    <button className="text-zinc-400 hover:text-white p-2 transition-colors">
                      <Paperclip className="w-5 h-5" />
                    </button>
                    <div className="flex-1">
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Type your message..."
                        rows={3}
                        className="w-full px-4 py-3 bg-[#081624] border border-blue-500/20 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                      />
                    </div>
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sending}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-md hover:shadow-lg"
                    >
                      {sending ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          <span>Send</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-zinc-500 mt-2">
                    Press Enter to send, Shift+Enter for new line
                  </p>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="w-20 h-20 text-zinc-700 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">Select a Conversation</h3>
                  <p className="text-zinc-400">
                    Choose a conversation from the list to view messages
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
    </ClientLayout>
  )
}
