'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { isAuthenticated } from '../../../../lib/auth'
import { leadAPI } from '../../../../lib/api'
import { useEffect } from 'react'
import { ArrowLeft, Upload, FileText, Download } from 'lucide-react'

export default function ImportLeadsPage() {
  const router = useRouter()
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [importedCount, setImportedCount] = useState(0)

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login')
    }
  }, [router])

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile)
        setError('')
      } else {
        setError('Please select a CSV file')
        setFile(null)
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) {
      setError('Please select a CSV file')
      return
    }

    setError('')
    setLoading(true)
    setSuccess(false)

    try {
      const result = await leadAPI.import(file)
      setImportedCount(result.count || 0)
      setSuccess(true)
      setTimeout(() => {
        router.push('/dashboard/leads')
      }, 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to import leads')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/leads"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Leads
          </Link>
          <h1 className="text-3xl font-bold mb-2">Import Leads</h1>
          <p className="text-slate-300">Upload a CSV file to import leads</p>
        </div>

        {/* Instructions */}
        <div className="glass-card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            CSV Format Requirements
          </h2>
          <ul className="space-y-2 text-slate-300 text-sm">
            <li>• CSV file must have headers: name, email, company</li>
            <li>• Email is required, name and company are optional</li>
            <li>• Maximum 50 leads per import (Tier 1 limit)</li>
            <li>• Duplicate emails will be skipped</li>
          </ul>
          <div className="mt-4">
            <button className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-2">
              <Download className="w-4 h-4" />
              Download Sample CSV
            </button>
          </div>
        </div>

        {/* Upload Form */}
        <div className="glass-card p-8">
          {success ? (
            <div className="text-center">
              <div className="mb-4">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-green-400" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Import Successful!</h2>
                <p className="text-slate-300">
                  Successfully imported {importedCount} lead{importedCount !== 1 ? 's' : ''}
                </p>
                <p className="text-slate-400 text-sm mt-2">Redirecting to leads page...</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Select CSV File</label>
                <div className="border-2 border-dashed border-white/10 rounded-lg p-8 text-center hover:border-blue-500/50 transition-colors">
                  <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer btn-secondary inline-block"
                  >
                    Choose File
                  </label>
                  {file && (
                    <p className="mt-4 text-slate-300">
                      Selected: <span className="text-white font-medium">{file.name}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading || !file}
                  className="btn-primary disabled:opacity-50"
                >
                  {loading ? 'Importing...' : 'Import Leads'}
                </button>
                <Link href="/dashboard/leads" className="btn-secondary">
                  Cancel
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

