import { useState } from 'react'
import { motion } from 'framer-motion'
import { HiLink, HiDocumentText, HiCheckCircle, HiXCircle, HiExclamationCircle, HiOutlineClipboardCheck } from 'react-icons/hi'
import { validateNovelty } from '../../services/api'
import { useResearchStore } from '../../store/researchStore'

type VerificationSource = 'pdf' | 'url'

const CitationVerificationPanel: React.FC = () => {
  const [source, setSource] = useState<VerificationSource>('pdf')
  const [url, setUrl] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile)
      setError('')
    } else {
      setError('Please upload a valid PDF file')
    }
  }

  const handleVerify = async () => {
    if (source === 'url' && !url.trim()) {
      setError('Please enter a paper URL')
      return
    }
    if (source === 'pdf' && !file) {
      setError('Please upload a PDF file')
      return
    }

    setIsVerifying(true)
    setError('')
    setResults(null)

    try {
      // This would call the backend citation verification endpoint
      // For now, simulate verification
      await new Promise(resolve => setTimeout(resolve, 2000))

      setResults({
        validCitations: [
          { citation: 'Smith et al. (2023) Deep Learning Methods', supports: true, confidence: 0.95 },
          { citation: 'Johnson (2022) Neural Networks', supports: true, confidence: 0.88 },
        ],
        invalidCitations: [
          { citation: 'Brown et al. (2021)', reason: 'Cannot verify claim support', confidence: 0.45 },
        ],
        formatIssues: [
          'Citation [3] missing publication year',
          'Inconsistent citation format detected',
        ],
      })
    } catch (err: any) {
      setError('Verification failed: ' + (err.message || 'Unknown error'))
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Citation Verification</h2>
      </div>

      {/* Source Selector */}
      <div className="flex gap-2">
        <button
          onClick={() => setSource('pdf')}
          className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${
            source === 'pdf'
              ? 'bg-indigo-600 text-white'
              : 'bg-dark-700/50 text-gray-400 hover:bg-dark-700'
          }`}
        >
          <HiDocumentText className="inline mr-2" />
          Upload PDF
        </button>
        <button
          onClick={() => setSource('url')}
          className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${
            source === 'url'
              ? 'bg-indigo-600 text-white'
              : 'bg-dark-700/50 text-gray-400 hover:bg-dark-700'
          }`}
        >
          <HiLink className="inline mr-2" />
          Paper URL
        </button>
      </div>

      {/* Input Area */}
      <div className="glass p-6 rounded-2xl space-y-4">
        {source === 'pdf' ? (
          <div>
            <label className="text-xs font-semibold text-gray-400 mb-2 block">UPLOAD PDF</label>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="w-full bg-dark-700/50 border border-dark-600 rounded-xl p-3 text-sm text-gray-300"
            />
            {file && (
              <p className="text-sm text-green-400 mt-2">✓ {file.name}</p>
            )}
          </div>
        ) : (
          <div>
            <label className="text-xs font-semibold text-gray-400 mb-2 block">PAPER URL</label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://arxiv.org/abs/XXXX.XXXXX or https://www.semanticscholar.org/paper/XXXX"
              className="w-full bg-dark-700/50 border border-dark-600 rounded-xl p-3 text-sm text-gray-300 outline-none focus:border-indigo-500/50"
            />
            <p className="text-xs text-gray-500 mt-2">
              Supports arXiv URLs and Semantic Scholar URLs
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleVerify}
          disabled={isVerifying || (source === 'pdf' ? !file : !url.trim())}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-semibold transition-all"
        >
          {isVerifying ? 'Verifying...' : 'Verify Citations'}
        </button>
      </div>

      {/* Results */}
      {results && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Valid Citations */}
          <div className="glass p-6 rounded-2xl">
            <h3 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2">
              <HiCheckCircle />
              Valid Citations ({results.validCitations.length})
            </h3>
            <div className="space-y-3">
              {results.validCitations.map((cit: any, i: number) => (
                <div key={i} className="p-3 bg-dark-700/50 rounded-xl">
                  <p className="text-sm text-white">{cit.citation}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-green-400">✓ Supports claim</span>
                    <span className="text-xs text-gray-500">
                      Confidence: {(cit.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Invalid Citations */}
          {results.invalidCitations.length > 0 && (
            <div className="glass p-6 rounded-2xl">
              <h3 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
                <HiXCircle />
                Invalid Citations ({results.invalidCitations.length})
              </h3>
              <div className="space-y-3">
                {results.invalidCitations.map((cit: any, i: number) => (
                  <div key={i} className="p-3 bg-dark-700/50 rounded-xl">
                    <p className="text-sm text-white">{cit.citation}</p>
                    <p className="text-xs text-red-400 mt-2">{cit.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Format Issues */}
          {results.formatIssues.length > 0 && (
            <div className="glass p-6 rounded-2xl">
              <h3 className="text-lg font-semibold text-yellow-400 mb-4 flex items-center gap-2">
                <HiExclamationCircle />
                Format Issues ({results.formatIssues.length})
              </h3>
              <ul className="space-y-2">
                {results.formatIssues.map((issue: string, i: number) => (
                  <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                    <span className="text-yellow-400 mt-0.5">⚠</span>
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}

export default CitationVerificationPanel
