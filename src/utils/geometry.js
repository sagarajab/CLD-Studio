// Geometry and intersection utility functions

/**
 * Calculates the intersection point(s) between a line segment and an ellipse.
 * @param {number} lineStartX
 * @param {number} lineStartY
 * @param {number} lineEndX
 * @param {number} lineEndY
 * @param {number} ellipseCenterX
 * @param {number} ellipseCenterY
 * @param {number} ellipseRadiusX
 * @param {number} ellipseRadiusY
 * @returns {Array<{x: number, y: number}>} Array of intersection points
 */
export function calculateLineSegmentEllipseIntersection(lineStartX, lineStartY, lineEndX, lineEndY, ellipseCenterX, ellipseCenterY, ellipseRadiusX, ellipseRadiusY) {
  // Translate line to ellipse center
  const x1 = lineStartX - ellipseCenterX
  const y1 = lineStartY - ellipseCenterY
  const x2 = lineEndX - ellipseCenterX
  const y2 = lineEndY - ellipseCenterY
  // Quadratic coefficients
  const dx = x2 - x1
  const dy = y2 - y1
  const A = (dx * dx) / (ellipseRadiusX * ellipseRadiusX) + (dy * dy) / (ellipseRadiusY * ellipseRadiusY)
  const B = 2 * (x1 * dx / (ellipseRadiusX * ellipseRadiusX) + y1 * dy / (ellipseRadiusY * ellipseRadiusY))
  const C = (x1 * x1) / (ellipseRadiusX * ellipseRadiusX) + (y1 * y1) / (ellipseRadiusY * ellipseRadiusY) - 1
  const discriminant = B * B - 4 * A * C
  if (discriminant < 0) return [] // No intersection
  const sqrtDisc = Math.sqrt(discriminant)
  const t1 = (-B + sqrtDisc) / (2 * A)
  const t2 = (-B - sqrtDisc) / (2 * A)
  const points = []
  if (t1 >= 0 && t1 <= 1) {
    points.push({
      x: x1 + dx * t1 + ellipseCenterX,
      y: y1 + dy * t1 + ellipseCenterY,
    })
  }
  if (t2 >= 0 && t2 <= 1 && t2 !== t1) {
    points.push({
      x: x1 + dx * t2 + ellipseCenterX,
      y: y1 + dy * t2 + ellipseCenterY,
    })
  }
  return points
}

/**
 * Calculates intersection between line and ellipse
 */
export function calculateEllipseIntersection(lineStartX, lineStartY, lineEndX, lineEndY, ellipseCenterX, ellipseCenterY, ellipseRadiusX, ellipseRadiusY) {
  // Translate line to ellipse coordinate system
  const dx = lineEndX - lineStartX
  const dy = lineEndY - lineStartY
  const translatedStartX = lineStartX - ellipseCenterX
  const translatedStartY = lineStartY - ellipseCenterY
  
  // Normalize ellipse to unit circle
  const normalizedStartX = translatedStartX / ellipseRadiusX
  const normalizedStartY = translatedStartY / ellipseRadiusY
  const normalizedDx = dx / ellipseRadiusX
  const normalizedDy = dy / ellipseRadiusY
  
  // Solve quadratic equation for intersection
  const a = normalizedDx * normalizedDx + normalizedDy * normalizedDy
  const b = 2 * (normalizedStartX * normalizedDx + normalizedStartY * normalizedDy)
  const c = normalizedStartX * normalizedStartX + normalizedStartY * normalizedStartY - 1
  
  const discriminant = b * b - 4 * a * c
  
  if (discriminant < 0) {
    // No intersection
    return null
  }
  
  const sqrtDiscriminant = Math.sqrt(discriminant)
  const t1 = (-b + sqrtDiscriminant) / (2 * a)
  const t2 = (-b - sqrtDiscriminant) / (2 * a)
  
  // Convert back to original coordinate system
  const intersection1 = {
    x: lineStartX + t1 * dx,
    y: lineStartY + t1 * dy
  }
  
  const intersection2 = {
    x: lineStartX + t2 * dx,
    y: lineStartY + t2 * dy
  }
  
  // Return the intersection point that's in the direction of the line
  const dist1 = Math.sqrt((intersection1.x - lineStartX) ** 2 + (intersection1.y - lineStartY) ** 2)
  const dist2 = Math.sqrt((intersection2.x - lineStartX) ** 2 + (intersection2.y - lineStartY) ** 2)
  
  // Return the intersection point that's further along the line direction
  return dist1 > dist2 ? intersection1 : intersection2
}

/**
 * Calculates intersection between line segment and ellipse
 */
export function calculateLineSegmentEllipseIntersectionDetailed(lineStartX, lineStartY, lineEndX, lineEndY, ellipseCenterX, ellipseCenterY, ellipseRadiusX, ellipseRadiusY) {
  // Translate line to ellipse coordinate system
  const dx = lineEndX - lineStartX
  const dy = lineEndY - lineStartY
  const translatedStartX = lineStartX - ellipseCenterX
  const translatedStartY = lineStartY - ellipseCenterY
  
  // Normalize ellipse to unit circle
  const normalizedStartX = translatedStartX / ellipseRadiusX
  const normalizedStartY = translatedStartY / ellipseRadiusY
  const normalizedDx = dx / ellipseRadiusX
  const normalizedDy = dy / ellipseRadiusY
  
  // Solve quadratic equation for intersection
  const a = normalizedDx * normalizedDx + normalizedDy * normalizedDy
  const b = 2 * (normalizedStartX * normalizedDx + normalizedStartY * normalizedDy)
  const c = normalizedStartX * normalizedStartX + normalizedStartY * normalizedStartY - 1
  
  const discriminant = b * b - 4 * a * c
  
  if (discriminant < 0) {
    // No intersection
    return null
  }
  
  const sqrtDiscriminant = Math.sqrt(discriminant)
  const t1 = (-b + sqrtDiscriminant) / (2 * a)
  const t2 = (-b - sqrtDiscriminant) / (2 * a)
  
  // Convert back to original coordinate system
  const intersection1 = {
    x: lineStartX + t1 * dx,
    y: lineStartY + t1 * dy
  }
  
  const intersection2 = {
    x: lineStartX + t2 * dx,
    y: lineStartY + t2 * dy
  }
  
  // For line segment, we want the intersection point that's in the direction of the line
  // Check which intersection is closer to the line end point
  const dist1 = Math.sqrt((intersection1.x - lineEndX) ** 2 + (intersection1.y - lineEndY) ** 2)
  const dist2 = Math.sqrt((intersection2.x - lineEndX) ** 2 + (intersection2.y - lineEndY) ** 2)
  
  // Return the intersection point that's closer to the line end point
  // This ensures we get the intersection in the direction of the line segment
  return dist1 < dist2 ? intersection1 : intersection2
}

/**
 * Calculates circular arc through three points
 */
export function calculateCircularArc(startX, startY, controlX, controlY, endX, endY) {
  // Midpoint of start-control chord
  const mid1X = (startX + controlX) / 2
  const mid1Y = (startY + controlY) / 2
  
  // Direction vector of start-control chord
  const dir1X = controlX - startX
  const dir1Y = controlY - startY
  
  // Perpendicular direction (rotate 90 degrees)
  const perp1X = -dir1Y
  const perp1Y = dir1X
  
  // Midpoint of control-end chord
  const mid2X = (controlX + endX) / 2
  const mid2Y = (controlY + endY) / 2
  
  // Direction vector of control-end chord
  const dir2X = endX - controlX
  const dir2Y = endY - controlY
  
  // Perpendicular direction (rotate 90 degrees)
  const perp2X = -dir2Y
  const perp2Y = dir2X
  
  // Find intersection of the two perpendicular bisectors
  // This is the center of the circle
  
  // Line 1: mid1 + t1 * perp1
  // Line 2: mid2 + t2 * perp2
  
  // Solve for t1 and t2 where the lines intersect
  const det = perp1X * perp2Y - perp1Y * perp2X
  
  if (Math.abs(det) < 1e-10) {
    // Lines are parallel, use a fallback
    // Fallback: create a straight line path
    return {
      centerX: (startX + endX) / 2,
      centerY: (startY + endY) / 2,
      radius: Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2) / 2,
      startAngle: Math.atan2(startY - (startY + endY) / 2, startX - (startX + endX) / 2),
      endAngle: Math.atan2(endY - (startY + endY) / 2, endX - (startX + endX) / 2),
      isStraightLine: true
    }
  }
  
  const t1 = ((mid2X - mid1X) * perp2Y - (mid2Y - mid1Y) * perp2X) / det
  
  const centerX = mid1X + t1 * perp1X
  const centerY = mid1Y + t1 * perp1Y
  
  // Calculate radius
  const radius = Math.sqrt((startX - centerX) ** 2 + (startY - centerY) ** 2)
  
  // Calculate angles
  const startAngle = Math.atan2(startY - centerY, startX - centerX)
  const endAngle = Math.atan2(endY - centerY, endX - centerX)
  
  return { centerX, centerY, radius, startAngle, endAngle }
}

/**
 * Calculates reference circle through two ellipse centers
 */
export function calculateReferenceCircle(center1X, center1Y, center2X, center2Y) {
  // The reference circle passes through both centers
  // Its center is the midpoint of the line between centers
  const centerX = (center1X + center2X) / 2
  const centerY = (center1Y + center2Y) / 2
  
  // Its radius is half the distance between centers
  const radius = Math.sqrt((center2X - center1X) ** 2 + (center2Y - center1Y) ** 2) / 2
  
  return { centerX, centerY, radius }
}

/**
 * Finds intersections between circle and ellipse
 */
export function findCircleEllipseIntersections(circleCenterX, circleCenterY, circleRadius, ellipseCenterX, ellipseCenterY, ellipseRadiusX, ellipseRadiusY) {
  // Method: Find intersections by checking multiple points around the circle
  const intersections = []
  const numPoints = 360 // Check every degree around the circle
  
  for (let i = 0; i < numPoints; i++) {
    const angle = (i * 2 * Math.PI) / numPoints
    
    // Point on the circle
    const circlePointX = circleCenterX + circleRadius * Math.cos(angle)
    const circlePointY = circleCenterY + circleRadius * Math.sin(angle)
    
    // Check if this point is on the ellipse
    const dx = circlePointX - ellipseCenterX
    const dy = circlePointY - ellipseCenterY
    const normalizedX = dx / ellipseRadiusX
    const normalizedY = dy / ellipseRadiusY
    const distance = normalizedX * normalizedX + normalizedY * normalizedY
    
    // If distance is close to 1, this point is on the ellipse
    if (Math.abs(distance - 1) < 0.1) {
      const intersection = { x: circlePointX, y: circlePointY }
      
      // Check if this intersection is already found (avoid duplicates)
      const isDuplicate = intersections.some(existing => 
        Math.abs(existing.x - intersection.x) < 1 && Math.abs(existing.y - intersection.y) < 1
      )
      
      if (!isDuplicate) {
        intersections.push(intersection)
      }
    }
  }
  
  return intersections
}

/**
 * Finds intersection points that lie inside the convex hull of the Bezier curve
 */
export function findConvexHullIntersection(controlPoint, ellipseCenterX, ellipseCenterY, ellipseRadiusX, ellipseRadiusY) {
  // Calculate the direction from control point to ellipse center
  const dx = ellipseCenterX - controlPoint.x
  const dy = ellipseCenterY - controlPoint.y
  const distance = Math.sqrt(dx * dx + dy * dy)
  
  if (distance === 0) return null
  
  // Normalize direction
  const dirX = dx / distance
  const dirY = dy / distance
  
  // Find intersection using the line from control point to ellipse center
  const intersection = calculateEllipseIntersection(
    controlPoint.x, controlPoint.y, ellipseCenterX, ellipseCenterY,
    ellipseCenterX, ellipseCenterY, ellipseRadiusX, ellipseRadiusY
  )
  
  if (!intersection) return null
  
  // Check if the intersection point lies between control point and ellipse center
  // This ensures it's inside the convex hull of the Bezier curve
  const intersectionToControl = {
    x: intersection.x - controlPoint.x,
    y: intersection.y - controlPoint.y
  }
  
  const intersectionToCenter = {
    x: intersection.x - ellipseCenterX,
    y: intersection.y - ellipseCenterY
  }
  
  // Check if intersection is between control point and center
  // by verifying the dot products have opposite signs
  const dot1 = intersectionToControl.x * dirX + intersectionToControl.y * dirY
  const dot2 = intersectionToCenter.x * dirX + intersectionToCenter.y * dirY
  
  // If dot1 is positive and dot2 is negative, intersection is between them
  if (dot1 > 0 && dot2 < 0) {
    return intersection
  }
  
  // If not, find the other intersection point
  // Extend the line beyond the ellipse center
  const extendedPoint = {
    x: ellipseCenterX + dirX * distance,
    y: ellipseCenterY + dirY * distance
  }
  
  const otherIntersection = calculateEllipseIntersection(
    extendedPoint.x, extendedPoint.y, ellipseCenterX, ellipseCenterY,
    ellipseCenterX, ellipseCenterY, ellipseRadiusX, ellipseRadiusY
  )
  
  return otherIntersection
} 

/**
 * Calculates intersection between circle and ellipse
 */
export function calculateCircleEllipseIntersection(circleCenterX, circleCenterY, circleRadius, ellipseCenterX, ellipseCenterY, ellipseRadiusX, ellipseRadiusY) {
  // Simple approach: find where the line from circle center to ellipse center intersects the ellipse
  // This will give us a point on the ellipse that we can use
  
  return calculateEllipseIntersection(
    circleCenterX, circleCenterY, ellipseCenterX, ellipseCenterY,
    ellipseCenterX, ellipseCenterY, ellipseRadiusX, ellipseRadiusY
  )
}

/**
 * Calculates intersection between circular arc and ellipse
 */
export function calculateArcEllipseIntersection(arcCenterX, arcCenterY, arcRadius, ellipseCenterX, ellipseCenterY, ellipseRadiusX, ellipseRadiusY, startAngle, endAngle) {
  // For now, let's use a simple approach: find where the line from arc center to ellipse center intersects the ellipse
  // This will give us a reasonable approximation
  
  const intersection = calculateEllipseIntersection(
    arcCenterX, arcCenterY, ellipseCenterX, ellipseCenterY,
    ellipseCenterX, ellipseCenterY, ellipseRadiusX, ellipseRadiusY
  )
  
  if (!intersection) return null
  
  // Check if this intersection point is within the arc range
  const intersectionAngle = Math.atan2(intersection.y - arcCenterY, intersection.x - arcCenterX)
  
  // Normalize angles to [0, 2π]
  let normalizedStartAngle = startAngle
  let normalizedEndAngle = endAngle
  let normalizedIntersectionAngle = intersectionAngle
  
  while (normalizedStartAngle < 0) normalizedStartAngle += 2 * Math.PI
  while (normalizedEndAngle < 0) normalizedEndAngle += 2 * Math.PI
  while (normalizedIntersectionAngle < 0) normalizedIntersectionAngle += 2 * Math.PI
  
  // Ensure startAngle <= endAngle
  if (normalizedStartAngle > normalizedEndAngle) {
    normalizedEndAngle += 2 * Math.PI
  }
  
  // Check if intersection angle is within arc range
  if (normalizedIntersectionAngle >= normalizedStartAngle && normalizedIntersectionAngle <= normalizedEndAngle) {
    return intersection
  }
  
  // If not, use the closest endpoint
  const distToStart = Math.min(
    Math.abs(normalizedIntersectionAngle - normalizedStartAngle),
    Math.abs(normalizedIntersectionAngle - (normalizedStartAngle + 2 * Math.PI))
  )
  const distToEnd = Math.min(
    Math.abs(normalizedIntersectionAngle - normalizedEndAngle),
    Math.abs(normalizedIntersectionAngle - (normalizedEndAngle - 2 * Math.PI))
  )
  
  // Use the closest endpoint
  const useStart = distToStart < distToEnd
  const endpointAngle = useStart ? normalizedStartAngle : normalizedEndAngle
  
  // Calculate the endpoint on the circle
  const endpointX = arcCenterX + arcRadius * Math.cos(endpointAngle)
  const endpointY = arcCenterY + arcRadius * Math.sin(endpointAngle)
  
  // Find where the line from arc center to endpoint intersects the ellipse
  return calculateEllipseIntersection(
    arcCenterX, arcCenterY, endpointX, endpointY,
    ellipseCenterX, ellipseCenterY, ellipseRadiusX, ellipseRadiusY
  )
} 