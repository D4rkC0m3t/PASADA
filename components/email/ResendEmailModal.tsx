/**
 * PASADA CRM - Resend Email Modal
 * UI component for resending emails with reason tracking
 */

'use client';

import { useState } from 'react';
import { X, Send, Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface ResendEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  emailId: string;
  originalTo: string;
  originalSubject: string;
  originalBody: string;
  currentResendCount: number;
  userId: string;
  onSuccess?: () => void;
}

export default function ResendEmailModal({
  isOpen,
  onClose,
  emailId,
  originalTo,
  originalSubject,
  originalBody,
  currentResendCount,
  userId,
  onSuccess,
}: ResendEmailModalProps) {
  const [reason, setReason] = useState('');
  const [to, setTo] = useState(originalTo);
  const [subject, setSubject] = useState(originalSubject);
  const [body, setBody] = useState(originalBody);
  const [sending, setSending] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  if (!isOpen) return null;

  const canResend = currentResendCount < 3;
  const remainingResends = 3 - currentResendCount;

  const handleResend = async () => {
    // Validation
    if (!reason.trim()) {
      toast.error('Please provide a reason for resending');
      return;
    }

    if (reason.trim().length < 10) {
      toast.error('Reason must be at least 10 characters');
      return;
    }

    if (!canResend) {
      toast.error('Maximum resend limit (3) reached for this email');
      return;
    }

    setSending(true);

    try {
      const response = await fetch('/api/email/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email_id: emailId,
          reason,
          user_id: userId,
          override_to: to !== originalTo ? to : undefined,
          override_subject: subject !== originalSubject ? subject : undefined,
          override_body: body !== originalBody ? body : undefined,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Email resent successfully! (${result.resend_count}/3)`);
        onSuccess?.();
        onClose();
        setReason('');
      } else {
        toast.error(result.error || 'Failed to resend email');
      }
    } catch (error: any) {
      console.error('Resend email error:', error);
      toast.error('Failed to resend email');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Resend Email</h2>
            <p className="mt-1 text-sm text-gray-500">
              Resends remaining: <span className="font-medium">{remainingResends}/3</span>
            </p>
          </div>
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
            {/* Warning if limit is near */}
            {currentResendCount >= 2 && (
              <div className="flex items-start gap-3 rounded-md border border-yellow-300 bg-yellow-50 p-4">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <div className="text-sm text-yellow-800">
                  <strong>Warning:</strong> You have {remainingResends}{' '}
                  {remainingResends === 1 ? 'resend' : 'resends'} remaining for this email.
                  After that, you'll need to create a new email.
                </div>
              </div>
            )}

            {/* Reason (Required) */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Reason for Resending <span className="text-red-500">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="e.g., Client requested resend due to inbox issues, Email bounced, etc."
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Minimum 10 characters. This will be logged for audit purposes.
              </p>
            </div>

            {/* Original Email Info */}
            <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
              <h3 className="mb-2 text-sm font-medium text-gray-700">Original Email</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <div>
                  <strong>To:</strong> {originalTo}
                </div>
                <div>
                  <strong>Subject:</strong> {originalSubject}
                </div>
                <div>
                  <strong>Resend Count:</strong> {currentResendCount}/3
                </div>
              </div>
            </div>

            {/* Advanced Options */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                {showAdvanced ? '- Hide' : '+ Show'} Advanced Options (Optional)
              </button>
            </div>

            {/* Advanced Fields */}
            {showAdvanced && (
              <div className="space-y-4 rounded-md border border-blue-200 bg-blue-50 p-4">
                <p className="text-sm text-blue-800">
                  Leave blank to use original values
                </p>

                {/* Override To */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Override Recipient
                  </label>
                  <input
                    type="email"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Override Subject */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Override Subject
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Override Body */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Override Body
                  </label>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={6}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t px-6 py-4">
          <div className="text-sm text-gray-500">
            All resends are logged for audit compliance
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
              onClick={handleResend}
              disabled={sending || !canResend}
              className="flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {sending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Resend Email
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
