'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Home, FolderOpen, FileText, Calendar, MessageSquare, LogOut, ArrowLeft,
  Bell, Check, CheckCheck, Trash2, Filter, User
} from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  link: string | null
  created_at: string
}

export default function ClientNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const supabase = createBrowserClient()

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      
      // TODO: Fetch from notifications table when created
      // Mock data for demonstration
      const mockNotifications: Notification[] = [
        {
          id: '1',
          title: 'Quotation Approved',
          message: 'Your quotation for Modern Kitchen project has been approved by the team.',
          type: 'success',
          read: false,
          link: '/client/quotations',
          created_at: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: '2',
          title: 'New Message',
          message: 'You have received a new message from the PASADA design team regarding your project.',
          type: 'info',
          read: false,
          link: '/client/messages',
          created_at: new Date(Date.now() - 7200000).toISOString()
        },
        {
          id: '3',
          title: 'Booking Confirmed',
          message: 'Your site visit appointment for tomorrow at 10:00 AM has been confirmed.',
          type: 'success',
          read: true,
          link: '/client/bookings',
          created_at: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: '4',
          title: 'Project Update',
          message: 'The status of your Classic White Kitchen project has been updated to "In Progress".',
          type: 'info',
          read: true,
          link: '/client/projects',
          created_at: new Date(Date.now() - 172800000).toISOString()
        },
        {
          id: '5',
          title: 'Payment Reminder',
          message: 'A payment installment for your project is due in 3 days.',
          type: 'warning',
          read: false,
          link: '/client/quotations',
          created_at: new Date(Date.now() - 259200000).toISOString()
        }
      ]

      setNotifications(mockNotifications)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      // TODO: Update in database
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      )
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      // TODO: Update all in database
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      // TODO: Delete from database
      setNotifications(prev => prev.filter(n => n.id !== id))
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  const getTypeColor = (type: string) => {
    const colors = {
      info: 'bg-blue-600/10 text-blue-600 border-blue-600/20',
      success: 'bg-green-600/10 text-green-600 border-green-600/20',
      warning: 'bg-yellow-600/10 text-yellow-600 border-yellow-600/20',
      error: 'bg-red-600/10 text-red-600 border-red-600/20',
    }
    return colors[type as keyof typeof colors] || colors.info
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} minutes ago`
    if (diffHours < 24) return `${diffHours} hours ago`
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    })
  }

  const filteredNotifications = notifications.filter(n => 
    filter === 'all' ? true : !n.read
  )

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-zinc-900 border-r border-zinc-800 p-6 z-10">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">P</span>
          </div>
          <span className="text-xl font-bold text-white">PASADA</span>
        </div>

        <nav className="space-y-2">
          <Link href="/client/dashboard" className="flex items-center space-x-3 px-4 py-3 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-all">
            <Home className="w-5 h-5" />
            <span>Dashboard</span>
          </Link>
          <Link href="/client/projects" className="flex items-center space-x-3 px-4 py-3 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-all">
            <FolderOpen className="w-5 h-5" />
            <span>My Projects</span>
          </Link>
          <Link href="/client/quotations" className="flex items-center space-x-3 px-4 py-3 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-all">
            <FileText className="w-5 h-5" />
            <span>Quotations</span>
          </Link>
          <Link href="/client/bookings" className="flex items-center space-x-3 px-4 py-3 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-all">
            <Calendar className="w-5 h-5" />
            <span>Bookings</span>
          </Link>
          <Link href="/client/messages" className="flex items-center space-x-3 px-4 py-3 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-all">
            <MessageSquare className="w-5 h-5" />
            <span>Messages</span>
          </Link>
        </nav>

        <div className="absolute bottom-6 left-6 right-6 space-y-2">
          <Link href="/client/profile" className="flex items-center space-x-3 px-4 py-3 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-all">
            <User className="w-5 h-5" />
            <span>Profile</span>
          </Link>
          <Link href="/login" className="flex items-center space-x-3 px-4 py-3 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-all">
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/client/dashboard"
            className="inline-flex items-center text-zinc-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Notifications</h1>
              <p className="text-zinc-400">
                {unreadCount > 0 
                  ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                  : 'All notifications are read'}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center space-x-2 px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-all"
              >
                <CheckCheck className="w-5 h-5" />
                <span>Mark All as Read</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mb-6 flex items-center space-x-3">
          <Filter className="w-5 h-5 text-zinc-500" />
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg border transition-all ${
              filter === 'all'
                ? 'bg-yellow-600 text-white border-yellow-600'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg border transition-all ${
              filter === 'unread'
                ? 'bg-yellow-600 text-white border-yellow-600'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-600 mb-4"></div>
            <p className="text-zinc-400">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-12 bg-zinc-900 border border-zinc-800 rounded-xl">
            <Bell className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">
              {filter === 'unread' ? 'No Unread Notifications' : 'No Notifications'}
            </h3>
            <p className="text-zinc-400">
              {filter === 'unread' 
                ? "You're all caught up!" 
                : "You don't have any notifications yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-zinc-900 border rounded-xl p-6 transition-all ${
                  !notification.read 
                    ? 'border-blue-600/30 hover:border-blue-600/50' 
                    : 'border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start space-x-3 mb-3">
                      <div className={`p-3 rounded-lg ${getTypeColor(notification.type)}`}>
                        <Bell className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-semibold text-white">
                            {notification.title}
                          </h3>
                          {!notification.read && (
                            <span className="w-2.5 h-2.5 bg-blue-600 rounded-full flex-shrink-0 mt-2 ml-2"></span>
                          )}
                        </div>
                        <p className="text-zinc-400 mb-3">{notification.message}</p>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="text-zinc-500">
                            {formatTime(notification.created_at)}
                          </span>
                          <span className={`px-2 py-1 rounded border text-xs ${getTypeColor(notification.type)}`}>
                            {notification.type.toUpperCase()}
                          </span>
                          {notification.link && (
                            <Link
                              href={notification.link}
                              onClick={() => markAsRead(notification.id)}
                              className="text-yellow-600 hover:text-yellow-500 font-medium"
                            >
                              View Details →
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-all"
                        title="Mark as read"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-600/10 rounded-lg transition-all"
                      title="Delete notification"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
