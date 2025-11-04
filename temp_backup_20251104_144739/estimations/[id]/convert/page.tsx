'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Check, AlertCircle } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'
import AuthGuard from '@/components/AuthGuard'
import Link from 'next/link'

interface EstimationItem {
  id: string
  item_number: number
  category: string
  description: string
  specifications: string
  quantity: number
  unit: string
  unit_price: number
  total: number
  notes: string
}

interface ItemWithHSN extends EstimationItem {
  hsn_sac_code: string
  gst_rate: number
}

export default function ConvertEstimationPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const supabase = createBrowserClient()
  
  const [estimation, setEstimation] = useState<any>(null)
  const [items, setItems] = useState<EstimationItem[]>([])
  const [itemsWithHSN, setItemsWithHSN] = useState<ItemWithHSN[]>([])
  const [loading, setLoading] = useState(true)
  const [converting, setConverting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchEstimation()
  }, [params.id])

  const fetchEstimation = async () => {
    try {
      setLoading(true)

      const { data: estimationData, error: estimationError } = await supabase
        .from('estimations')
        .select(`
          *,
          projects (
            name,
            clients (
              name,
              gstin
            )
          ),
          clients (
            name,
            gstin
          )
        `)
        .eq('id', params.id)
        .single()

      if (estimationError) throw estimationError
      setEstimation(estimationData)

      const { data: itemsData, error: itemsError } = await supabase
        .from('estimation_items')
        .select('*')
        .eq('estimation_id', params.id)
        .order('item_number', { ascending: true })

      if (itemsError) throw itemsError
      setItems(itemsData || [])

      // Initialize items with default HSN/SAC codes
      const initialItems = (itemsData || []).map(item => ({
        ...item,
        hsn_sac_code: '998599', // Default service code
        gst_rate: 18
      }))
      setItemsWithHSN(initialItems)
    } catch (error) {
      console.error('Error fetching estimation:', error)
      setError('Failed to load estimation')
    } finally {
      setLoading(false)
    }
  }

  const updateItemHSN = (itemNumber: number, field: 'hsn_sac_code' | 'gst_rate', value: string | number) => {
    setItemsWithHSN(prev => prev.map(item => 
      item.item_number === itemNumber 
        ? { ...item, [field]: value }
        : item
    ))
  }

  const handleConvert = async () => {
    try {
      setConverting(true)
      setError('')

      // Validate HSN/SAC codes
      const invalidItems = itemsWithHSN.filter(item => !item.hsn_sac_code || item.hsn_sac_code.length < 4)
      if (invalidItems.length > 0) {
        setError('Please provide valid HSN/SAC codes for all items (minimum 4 digits)')
        return
      }

      const response = await fetch(`/api/estimations/${params.id}/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items_with_hsn: itemsWithHSN })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to convert')
      }

      alert(`Successfully converted to quotation ${data.quotation_number}!`)
      router.push(`/admin/quotations/${data.quotation_id}`)
    } catch (error) {
      console.error('Error converting:', error)
      setError(error instanceof Error ? error.message : 'Failed to convert estimation')
    } finally {
      setConverting(false)
    }
  }

  if (loading) {
    return (
      <AuthGuard requiredRole="admin">
        <div className="p-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
            <p className="text-zinc-400 mt-4">Loading estimation...</p>
          </div>
        </div>
      </AuthGuard>
    )
  }

  if (!estimation) {
    return (
      <AuthGuard requiredRole="admin">
        <div className="p-8">
          <div className="text-center py-12">
            <p className="text-zinc-400 text-lg">Estimation not found</p>
            <Link
              href="/admin/estimations"
              className="inline-flex items-center space-x-2 mt-4 text-green-600 hover:text-green-500"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Estimations</span>
            </Link>
          </div>
        </div>
      </AuthGuard>
    )
  }

  const client = estimation.projects?.clients || estimation.clients
  const isB2B = !!client?.gstin

  return (
    <AuthGuard requiredRole="admin">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href={`/admin/estimations/${params.id}`}
              className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-zinc-400" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Convert to Quotation</h1>
              <p className="text-zinc-400">{estimation.estimation_number} → GST Quotation</p>
            </div>
          </div>
          <button
            onClick={handleConvert}
            disabled={converting}
            className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-lg shadow-green-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {converting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                <span>Converting...</span>
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                <span>Convert to Quotation</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-900/20 border border-red-800 rounded-lg p-4 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-400 font-medium">Conversion Error</p>
              <p className="text-red-300 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="mb-6 bg-blue-900/20 border border-blue-800 rounded-lg p-4">
          <h3 className="text-blue-400 font-medium mb-2">What happens during conversion?</h3>
          <ul className="text-blue-300 text-sm space-y-1">
            <li>• HSN/SAC codes will be added to all items</li>
            <li>• GST will be calculated based on {isB2B ? 'B2B' : 'B2C'} rules</li>
            <li>• {isB2B ? 'CGST/SGST or IGST' : 'IGST'} will be applied automatically</li>
            <li>• A new quotation will be created with all GST details</li>
            <li>• This estimation will be marked as "converted"</li>
          </ul>
        </div>

        {/* Items with HSN/SAC */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Add HSN/SAC Codes & GST Rates</h2>
          <p className="text-zinc-400 text-sm mb-6">
            Please review and update HSN/SAC codes and GST rates for each item before converting.
          </p>

          <div className="space-y-4">
            {itemsWithHSN.map((item) => (
              <div key={item.id} className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Left: Item Details */}
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-medium text-zinc-500">#{item.item_number}</span>
                      {item.category && (
                        <span className="text-xs bg-zinc-700 text-zinc-300 px-2 py-1 rounded">
                          {item.category}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-medium text-white mb-1">{item.description}</h3>
                    {item.specifications && (
                      <p className="text-sm text-zinc-400 mb-2">{item.specifications}</p>
                    )}
                    <div className="flex items-center space-x-4 text-sm text-zinc-400">
                      <span>{item.quantity} {item.unit}</span>
                      <span>×</span>
                      <span>₹{item.unit_price.toLocaleString('en-IN')}</span>
                      <span>=</span>
                      <span className="text-white font-medium">₹{item.total.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {/* Right: HSN/SAC & GST */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">
                        HSN/SAC Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={item.hsn_sac_code}
                        onChange={(e) => updateItemHSN(item.item_number, 'hsn_sac_code', e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-green-600 transition-colors"
                        placeholder="e.g., 9403 or 998599"
                        maxLength={8}
                      />
                      <p className="text-xs text-zinc-500 mt-1">
                        HSN for goods (4-8 digits) or SAC for services (6 digits)
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">
                        GST Rate (%) <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={item.gst_rate}
                        onChange={(e) => updateItemHSN(item.item_number, 'gst_rate', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-green-600 transition-colors"
                      >
                        <option value="0">0% (Exempt)</option>
                        <option value="5">5%</option>
                        <option value="12">12%</option>
                        <option value="18">18%</option>
                        <option value="28">28%</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="mt-6 bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Conversion Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-zinc-400 mb-1">Current Total (No GST)</p>
              <p className="text-2xl font-bold text-white">₹{estimation.total.toLocaleString('en-IN')}</p>
            </div>
            <div>
              <p className="text-sm text-zinc-400 mb-1">Estimated GST (18%)</p>
              <p className="text-2xl font-bold text-yellow-400">
                ₹{((estimation.total * 18) / 100).toLocaleString('en-IN')}
              </p>
            </div>
            <div>
              <p className="text-sm text-zinc-400 mb-1">Estimated Total with GST</p>
              <p className="text-2xl font-bold text-green-400">
                ₹{(estimation.total * 1.18).toLocaleString('en-IN')}
              </p>
            </div>
          </div>
          <p className="text-xs text-zinc-500 mt-4">
            * Actual GST will be calculated based on individual item rates during conversion
          </p>
        </div>
      </div>
    </AuthGuard>
  )
}
