// Debounce function to limit how often a function can be called
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Throttle function to limit function execution rate
export const throttle = (func, limit) => {
  let inThrottle
  return function() {
    const args = arguments
    const context = this
    if (!inThrottle) {
      func.apply(context, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// Generate unique ID
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9)
}

// Deep clone object
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime())
  if (obj instanceof Array) return obj.map(item => deepClone(item))
  if (typeof obj === 'object') {
    const clonedObj = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
}

// Validate email format
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Format timestamp
export const formatTimestamp = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString()
}

// Calculate distance between two points
export const calculateDistance = (point1, point2) => {
  const dx = point2.x - point1.x
  const dy = point2.y - point1.y
  return Math.sqrt(dx * dx + dy * dy)
}

// Check if point is within rectangle
export const isPointInRect = (point, rect) => {
  return point.x >= rect.x && 
         point.x <= rect.x + rect.width && 
         point.y >= rect.y && 
         point.y <= rect.y + rect.height
}

// Capitalize first letter
export const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// Truncate text with ellipsis
export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// Safe JSON parse
export const safeJsonParse = (str, defaultValue = null) => {
  try {
    return JSON.parse(str)
  } catch (error) {
    return defaultValue
  }
}

// Safe JSON stringify
export const safeJsonStringify = (obj, defaultValue = '{}') => {
  try {
    return JSON.stringify(obj)
  } catch (error) {
    return defaultValue
  }
} 