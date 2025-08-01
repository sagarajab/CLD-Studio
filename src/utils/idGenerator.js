import { nanoid } from 'nanoid'

/**
 * Generate a unique ID using nanoid
 * @param {number} size - Length of the ID (default: 10)
 * @returns {string} Unique ID
 */
export const generateUniqueId = (size = 10) => {
  return nanoid(size)
}

/**
 * Generate a unique integer ID that doesn't conflict with existing IDs
 * @param {Array} existingIds - Array of existing integer IDs
 * @returns {number} Next available integer ID
 */
export const generateUniqueIntegerId = (existingIds = []) => {
  if (existingIds.length === 0) {
    return 1
  }
  
  let nextId = 1
  while (existingIds.includes(nextId)) {
    nextId++
  }
  return nextId
}

/**
 * Generate a unique node ID that doesn't conflict with existing node IDs
 * @param {Array} nodes - Array of existing nodes
 * @returns {number} Next available node ID
 */
export const generateUniqueNodeId = (nodes = []) => {
  const existingIds = nodes.map(node => node.id)
  return generateUniqueIntegerId(existingIds)
}

/**
 * Generate a unique edge ID that doesn't conflict with existing edge IDs
 * @param {Array} edges - Array of existing edges
 * @returns {number} Next available edge ID
 */
export const generateUniqueEdgeId = (edges = []) => {
  const existingIds = edges.map(edge => edge.id)
  return generateUniqueIntegerId(existingIds)
} 