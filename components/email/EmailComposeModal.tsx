/**
 * PASADA CRM - Email Compose Modal
 * UI component for composing and sending manual emails via SMTP
 */

'use client';

import { useState } from 'react';
import { X, Send, Loader2, Paperclip } from 'lucide-react';
import toast from 'react-hot-toast';

interface EmailComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTo?: string;
  defaultSubject?: string;
  defaultBody?: string;
  leadId?: string;
  clientId?: string;
  projectId?: string;
  quotationId?: string;
  userId: string;
}

export default function EmailComposeModal({
  isOpen,
  onClose,
  defaultTo = '',
  defaultSubject = '',
  defaultBody = '',
  leadId,
  clientId,
  projectId,
  quotationId,
  userId,
}: EmailComposeModalProps) {
  const [to, setTo] = useState(defaultTo);
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody] = useState(defaultBody);
  const [fromName, setFromName] = useState('PASADA Support');
  const [sending, setSending] = useState(false);
  const [showCcBcc, setShowCcBcc] = useState(false);

  if (!isOpen) return null;

  const handleSend = async () => {
    // Validation
    if (!to.trim()) {
      toast.error('Please enter recipient email');
      return;
    }

    if (!subject.trim()) {
      toast.error('Please enter email subject');
      return;
    }

    if (!body.trim()) {
      toast.error('Please enter email body');
      return;
    }

    setSending(true);

    try {
      const response = await fetch('/api/email/smtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to,
          cc: cc ? cc.split(',').map((e) => e.trim()) : undefined,
          bcc: bcc ? bcc.split(',').map((e) => e.trim()) : undefined,
          subject,
          html: body.replace(/\n/g, '<br>'),
          text: body,
          from_name: fromName,
          lead_id: leadId,
          client_id: clientId,
          project_id: projectId,
          quotation_id: quotationId,
          user_id: userId,
          email_type: 'custom',
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Email sent successfully!');
        onClose();
        // Reset form
        setTo('');
        setCc('');
        setBcc('');
        setSubject('');
        setBody('');
      } else {
        toast.error(result.error || 'Failed to send email');
      }
    } catch (error: any) {
      console.error('Send email error:', error);
      toast.error('Failed to send email');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-3xl rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900">Compose Email</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={sending}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[calc(100vh-200px)] overflow-y-auto p-6">
          <div className="space-y-4">
            {/* From Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                From Name
              </label>
              <input
                type="text"
                value={fromName}
                onChange={(e) => setFromName(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="PASADA Support"
              />
            </div>

            {/* To */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                To <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="recipient@example.com"
                required
              />
            </div>

            {/* CC/BCC Toggle */}
            {!showCcBcc && (
              <button
                type="button"
                onClick={() => setShowCcBcc(true)}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                + Add Cc/Bcc
              </button>
            )}

            {/* CC */}
            {showCcBcc && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Cc</label>
                <input
                  type="text"
                  value={cc}
                  onChange={(e) => setCc(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="email1@example.com, email2@example.com"
                />
              </div>
            )}

            {/* BCC */}
            {showCcBcc && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Bcc</label>
                <input
                  type="text"
                  value={bcc}
                  onChange={(e) => setBcc(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="email1@example.com, email2@example.com"
                />
              </div>
            )}

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Email subject"
                required
              />
            </div>

            {/* Body */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={12}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Type your message here..."
                required
              />
            </div>

            {/* Attachments (Future Enhancement) */}
            <div>
              <button
                type="button"
                className="flex items-center text-sm text-gray-600 hover:text-gray-800"
                disabled
              >
                <Paperclip className="mr-2 h-4 w-4" />
                Attachments (Coming Soon)
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t px-6 py-4">
          <div className="text-sm text-gray-500">
            Sending via Zoho SMTP (support@pasada.in)
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              disabled={sending}
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={sending}
              className="flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {sending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Email
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
