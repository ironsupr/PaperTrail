import { useCallback, useMemo } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  type Edge,
  type Node,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useResearchStore } from '../../store/researchStore'
import PaperNode from '../GraphNode'

const nodeTypes = { paperNode: PaperNode }

function GraphBackground() {
  const graphData = useResearchStore((state) => state.graphData)

  const nodes = useMemo<Node[]>(() =>
    graphData.nodes.map((n) => ({
      id: n.id,
      type: 'paperNode',
      position: { x: n.x, y: n.y },
      data: {
        id: n.id,
        label: n.label,
        year: n.year,
        isCentral: n.isCentral,
        summary: n.summary,
      },
    })),
    [graphData.nodes]
  )

  const edges = useMemo<Edge[]>(() =>
    graphData.edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      animated: true,
      style: { stroke: 'rgba(92, 124, 250, 0.3)', strokeWidth: 1.5 },
    })),
    [graphData.edges]
  )

  const defaultEdgeOptions = useMemo(() => ({
    style: { stroke: 'rgba(92, 124, 250, 0.2)', strokeWidth: 1 },
  }), [])

  return (
    <div className="absolute inset-0 z-0">
       <ReactFlow
         nodes={nodes}
         edges={edges}
         nodeTypes={nodeTypes}
         defaultEdgeOptions={defaultEdgeOptions}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.1}
        maxZoom={2}
        panOnDrag
        zoomOnScroll
        selectionOnDrag
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable
        onNodeClick={(_, node) => {
          useResearchStore.getState().selectNode(node.id)
        }}
      >
        <Background
          color="rgba(92, 124, 250, 0.08)"
          gap={30}
          size={1}
        />
        <Controls
          showInteractive={false}
          className="!bg-dark-800/80 !border-dark-700/50 !rounded-lg"
          style={{
            bottom: '100px',
            right: '20px',
          }}
        />
      </ReactFlow>
    </div>
  )
}

export default GraphBackground
