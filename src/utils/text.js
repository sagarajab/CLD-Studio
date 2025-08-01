// Utility for wrapping text and calculating label dimensions

/**
 * Wraps text to fit a maximum width (approximate, based on font size).
 * @param {string} text - The text to wrap.
 * @param {number} maxWidth - The maximum width in pixels.
 * @param {number} [fontSize=16] - The font size in pixels.
 * @returns {string[]} Array of wrapped lines.
 */
export function wrapText(text, maxWidth, fontSize = 16, onConstraintViolation = null) {
  const charWidth = fontSize * 0.6 // More accurate character width estimation
  const lines = text.split('\n')
  const wrappedLines = []
  
  for (const line of lines) {
    const words = line.split(' ')
    let currentLine = ''
    
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word
      const testWidth = testLine.length * charWidth
      
      if (testWidth <= maxWidth) {
        currentLine = testLine
      } else {
        if (currentLine) {
          wrappedLines.push(currentLine)
          currentLine = word
        } else {
          // Single word is too long, break it into chunks
          const wordChunks = []
          const charsPerLine = Math.max(1, Math.floor(maxWidth / charWidth))
          
          for (let i = 0; i < word.length; i += charsPerLine) {
            const chunk = word.slice(i, i + charsPerLine)
            if (chunk.length > 0) {
              wordChunks.push(chunk)
            }
          }
          wrappedLines.push(...wordChunks)
          currentLine = ''
        }
      }
    }
    
    if (currentLine) {
      wrappedLines.push(currentLine)
    }
  }
  
  // Check if we need to truncate due to line limit
  const originalLineCount = wrappedLines.length
  const truncatedLines = wrappedLines.slice(0, 4)
  
  if (originalLineCount > 4 && onConstraintViolation) {
    onConstraintViolation('⚠️ Text truncated: too many lines (max 4)')
  }
  
  return truncatedLines
}

/**
 * Calculates ellipse dimensions for a label.
 * @param {string} label - The label text.
 * @param {object} [options] - Options for calculation.
 * @param {number} [options.baseWidth=40] - Minimum width of the ellipse.
 * @param {number} [options.baseHeight=40] - Minimum height of the ellipse.
 * @param {number} [options.padding=16] - Padding around the text.
 * @param {number} [options.maxTextWidth=120] - Maximum width for text wrapping.
 * @param {number} [options.maxEllipseWidth=200] - Maximum width of the ellipse.
 * @param {number} [options.fontSize=16] - Font size for text calculations.
 * @returns {object} Ellipse dimensions and wrapped lines.
 */
export function getEllipseDimensions(label, options = {}) {
  const {
    baseWidth = 40,
    baseHeight = 32,
    padding = 10,
 
    maxTextWidth = 170,
    maxEllipseWidth = 200,
    fontSize = 16,
    onConstraintViolation = null,
  } = options
  
  const lineHeight = fontSize + 3
  
  // Calculate text wrapping based on maximum available width
  const wrappedLines = wrapText(label, maxTextWidth, fontSize, onConstraintViolation)
  const calculateLineWidth = (line) => line.length * fontSize * 0.6
  const lineWidths = wrappedLines.map(calculateLineWidth)
  const maxLineWidth = Math.max(...lineWidths, 0)
  const textWidth = Math.min(maxLineWidth, maxTextWidth)
  
  // Calculate ellipse dimensions based on text content
  let width = Math.max(baseWidth, textWidth + padding)
  let height = Math.max(baseHeight, wrappedLines.length * lineHeight + padding)
  
  // Apply maximum width constraint if needed
  if (width > maxEllipseWidth) {
    width = maxEllipseWidth
  }
  
  // Apply minimum aspect ratio constraint: height must be at least 30% of width
  const minAspectRatio = 0.35 // height/width ratio
  const currentAspectRatio = height / width
  
  if (currentAspectRatio < minAspectRatio) {
    // If height is too small relative to width, increase height
    height = width * minAspectRatio
  }
  
  return {
    width,
    height,
    centerX: width / 2,
    centerY: height / 2,
    radiusX: width / 2,
    radiusY: height / 2,
    wrappedLines,
    lineHeight,
    textPadding: padding / 2,
  }
} 