import React, { useState, useRef, useCallback } from 'react'
import ReactFlow, {
  Edge,
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
} from 'reactflow'
import 'reactflow/dist/style.css'
import Sidebar from './sidebar'
import './style.css'

const initialNodes = [
  {
    id: '1',
    type: 'input',
    data: { label: 'input node' },
    position: { x: 250, y: 5 },
  },
]

let id = 0
const getId = () => `dndnode_${id++}`

const DnDFlow = () => {
  const reactFlowWrapper = useRef(null)
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [reactFlowInstance, setReactFlowInstance] = useState(null)

  // State for editing nodes
  const [editValue, setEditValue] = useState(nodes.data)
  const [selectedNodeId, setSelectedNodeId] = useState(null)

  // Handle node click to set editing state
  const onNodeClick = (e, node) => {
    setEditValue(node.data.label)
    setSelectedNodeId(node.id)
  }

  // Handle label change
  const handleChange = (e) => {
    e.preventDefault()
    setEditValue(e.target.value)
  }

  // Handle label update
  const handleEdit = () => {
    const updatedNodes = nodes.map((node) => {
      if (node.id === selectedNodeId) {
        return {
          ...node,
          data: {
            ...node.data,
            label: editValue,
          },
        }
      }
      return node
    })
    setNodes(updatedNodes)
    setEditValue('')
  }

  // Handle connecting nodes
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    []
  )

  // Handle drag over event
  const onDragOver = useCallback((event) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  // Handle drop event
  const onDrop = useCallback(
    (event) => {
      event.preventDefault()
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect()
      const type = event.dataTransfer.getData('application/reactflow')

      if (typeof type === 'undefined' || !type) {
        return
      }

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      })

      const newNode = {
        id: getId(),
        type,
        position,
        data: { label: `${type} node` },
      }

      setNodes((nds) => nds.concat(newNode))
    },
    [reactFlowInstance]
  )

  // Move selected node up
  const moveNode = (direction) => {
    const updatedNodes = nodes.map((node) => {
      if (node.id === selectedNodeId) {
        const newPosition = { ...node.position }
        switch (direction) {
          case 'up':
            newPosition.y -= 10
            break
          case 'down':
            newPosition.y += 10
            break
          case 'left':
            newPosition.x -= 10
            break
          case 'right':
            newPosition.x += 10
            break
          default:
            break
        }
        return {
          ...node,
          position: newPosition,
        }
      }
      return node
    })
    setNodes(updatedNodes)
  }

  return (
    <div className='dndflow'>
      <div className='updatenode__controls'>
        <label>Label:</label>
        <br />
        <input type='text' value={editValue} onChange={handleChange} /> <br />
        <button onClick={handleEdit} className='btn'>
          Update
        </button>
        <br />
        <button onClick={() => moveNode('up')} className='btn'>
          Move Up
        </button>
        <br />
        <button onClick={() => moveNode('down')} className='btn'>
          Move Down
        </button>
        <br />
        <button onClick={() => moveNode('left')} className='btn'>
          Move Left
        </button>
        <br />
        <button onClick={() => moveNode('right')} className='btn'>
          Move Right
        </button>
      </div>
      <ReactFlowProvider>
        <div className='reactflow-wrapper' ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodeClick={onNodeClick}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            fitView
          >
            <Background color='#99b3ec' variant='lines' />
            <Controls />
          </ReactFlow>
        </div>
        <Sidebar />
      </ReactFlowProvider>
    </div>
  )
}

export default DnDFlow
