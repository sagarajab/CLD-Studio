import React from 'react'
import { AlertCircle, AlertTriangle, X, CheckCircle } from 'lucide-react'
import './ValidationErrorModal.css'

function ValidationErrorModal({ 
  isOpen, 
  onClose, 
  validationResult, 
  fileName = '', 
  fileType = '',
  onRetry = null,
  onContinue = null 
}) {
  if (!isOpen || !validationResult) return null

  const { isValid, errors, warnings } = validationResult
  const hasErrors = errors && errors.length > 0
  const hasWarnings = warnings && warnings.length > 0

  const getFileTypeDisplay = () => {
    switch (fileType.toLowerCase()) {
      case '.cld': return 'Causal Loop Diagram'
      case '.cldq': return 'Assignment'
      case '.json': return 'JSON File'
      default: return fileType || 'File'
    }
  }

  const getIcon = () => {
    if (isValid) return <CheckCircle size={24} className="icon-success" />
    if (hasErrors) return <AlertCircle size={24} className="icon-error" />
    return <AlertTriangle size={24} className="icon-warning" />
  }

  const getTitle = () => {
    if (isValid && !hasWarnings) return 'File Validated Successfully'
    if (isValid && hasWarnings) return 'File Loaded with Warnings'
    return 'File Validation Failed'
  }

  const getDescription = () => {
    if (isValid && !hasWarnings) {
      return `${getFileTypeDisplay()} "${fileName}" has been validated and is ready to use.`
    }
    if (isValid && hasWarnings) {
      return `${getFileTypeDisplay()} "${fileName}" has been loaded but contains some warnings.`
    }
    return `${getFileTypeDisplay()} "${fileName}" contains errors that prevent it from being loaded.`
  }

  return (
    <div className="validation-error-overlay">
      <div className="validation-error-modal">
        <div className="validation-error-header">
          <div className="validation-error-title">
            {getIcon()}
            <h2>{getTitle()}</h2>
          </div>
          <button className="close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="validation-error-content">
          <p className="validation-description">{getDescription()}</p>

          {hasErrors && (
            <div className="validation-section">
              <h3 className="section-title error">
                <AlertCircle size={16} />
                Errors ({errors.length})
              </h3>
              <ul className="validation-list error-list">
                {errors.map((error, index) => (
                  <li key={index} className="validation-item error-item">
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {hasWarnings && (
            <div className="validation-section">
              <h3 className="section-title warning">
                <AlertTriangle size={16} />
                Warnings ({warnings.length})
              </h3>
              <ul className="validation-list warning-list">
                {warnings.map((warning, index) => (
                  <li key={index} className="validation-item warning-item">
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!isValid && (
            <div className="validation-help">
              <h4>How to fix these issues:</h4>
              <ul>
                <li>Check that the file format matches the expected structure</li>
                <li>Ensure all required fields are present</li>
                <li>Verify that data types are correct</li>
                <li>Check for any syntax errors in the JSON</li>
              </ul>
            </div>
          )}
        </div>

        <div className="validation-error-actions">
          {onRetry && (
            <button 
              className="action-button retry-button"
              onClick={onRetry}
            >
              Try Again
            </button>
          )}
          
          {isValid && onContinue && (
            <button 
              className="action-button continue-button"
              onClick={onContinue}
            >
              Continue Loading
            </button>
          )}
          
          <button 
            className="action-button close-action-button"
            onClick={onClose}
          >
            {isValid ? 'Close' : 'Cancel'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ValidationErrorModal 