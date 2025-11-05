import { redirect } from 'next/navigation'

export default function InvoicesPage() {
  // Redirect to the invoice list page
  redirect('/admin/invoices/list')
}

