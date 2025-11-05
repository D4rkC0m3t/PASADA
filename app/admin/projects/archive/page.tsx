import { requireAdmin } from '@/lib/auth'
import CRMLayout from '@/components/CRMLayout'
import Link from 'next/link'
import { Archive, Search } from 'lucide-react'

export default async function ArchivedProjectsPage() {
  const session = await requireAdmin()

  // TODO: Fetch archived projects from database
  const archivedProjects = []

  return (
    <CRMLayout userRole="admin" userName={session.user.name}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Archive className="w-8 h-8 text-zinc-400" />
              Archived Projects
            </h1>
            <p className="mt-2 text-zinc-400">
              View and restore archived project records
            </p>
          </div>
          <Link
            href="/admin/projects"
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
          >
            Back to Active Projects
          </Link>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
          <input
            type="search"
            placeholder="Search archived projects..."
            className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-600"
          />
        </div>

        {/* Content */}
        {archivedProjects.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-12 text-center">
            <Archive className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No Archived Projects
            </h3>
            <p className="text-zinc-400">
              Archived projects will appear here
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {/* Archive project cards will go here */}
          </div>
        )}
      </div>
    </CRMLayout>
  )
}

