import { memo } from 'react'
import { Handle, Position, type Node } from '@xyflow/react'
import { useResearchStore } from '../store/researchStore'

type PaperNodeData = {
  label: string
  year: number
  isCentral?: boolean
  summary: string
  authors?: string[]
  url?: string
}

type PaperNodeType = Node<PaperNodeData>

interface PaperNodeProps {
  id: string
  data: PaperNodeData
  selected: boolean
}

const PaperNode = memo(({ id, data, selected }: PaperNodeProps) => {
  const selectNode = useResearchStore((state) => state.selectNode)
  const { label, year, isCentral, authors, url } = data

  const summaryText = data?.summary || ''

  return (
    <div
      className={`
        relative cursor-pointer transition-all duration-300
        ${selected
          ? 'ring-2 ring-brain-400 scale-105 shadow-[0_0_30px_rgba(92,124,250,0.4)]'
          : 'hover:ring-1 hover:ring-brain-500/50 hover:scale-102'
        }
      `}
      onClick={() => selectNode(id)}
    >
      <Handle type="target" position={Position.Top} className="w-2 h-2 bg-brain-400" />

      <div className={`
        px-3 py-2 rounded-lg border backdrop-blur-sm min-w-[160px] max-w-[220px]
        ${isCentral
          ? 'bg-brain-900/90 border-brain-500/60 shadow-lg'
          : 'bg-dark-800/90 border-dark-600/40 shadow-md'
        }
      `}>
        <div className="flex items-start gap-2">
          <div className={`
            w-2 h-2 rounded-full mt-1.5 shrink-0
            ${isCentral ? 'bg-brain-400 animate-pulse' : 'bg-gray-500'}
          `} />
          <div className="min-w-0">
            {url ? (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-gray-100 leading-tight line-clamp-2 hover:text-brain-300 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {label}
              </a>
            ) : (
              <p className="text-xs font-medium text-gray-100 leading-tight line-clamp-2" title={summaryText}>
                {label}
              </p>
            )}
            {authors && authors.length > 0 && (
              <p className="text-[9px] text-gray-400 mt-0.5 line-clamp-1">
                {authors.slice(0, 2).join(', ')}{authors.length > 2 ? ' et al.' : ''}
              </p>
            )}
            <p className="text-[10px] text-gray-500 mt-0.5">{year}</p>
          </div>
        </div>
      </div>

      {/* Show full citation text on hover/select */}
      {selected && summaryText && (
        <div className="absolute top-full left-0 mt-2 p-2 bg-dark-800/95 border border-dark-700/50 rounded-lg text-[10px] text-gray-300 max-w-[300px] z-50 shadow-xl">
          {summaryText}
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="w-2 h-2 bg-brain-400" />
    </div>
  )
})

PaperNode.displayName = 'PaperNode'

export type { PaperNodeType }
export default PaperNode
