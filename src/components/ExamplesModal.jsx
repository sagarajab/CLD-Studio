import React, { useState, useEffect, useCallback } from 'react'
import { useCLDStore } from '../stores/cldStore'
import { Database, Download, Eye, FileText, Filter, X } from 'lucide-react'
import './ExamplesModal.css'

function ExamplesModal({ isOpen, onClose }) {
  const { loadDiagramData } = useCLDStore()
  const [examples, setExamples] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedExample, setSelectedExample] = useState(null)

  // Load examples from the examples index file
  const [examplesIndex, setExamplesIndex] = useState(null)
  const [thumbnails, setThumbnails] = useState({})
  const [thumbnailLoading, setThumbnailLoading] = useState({})
  const [examplesLoading, setExamplesLoading] = useState(false)

  // Cache for thumbnails to avoid re-fetching
  const thumbnailCache = React.useRef({})

  // Tab state
  const [activeTab, setActiveTab] = useState('default')

  // Filter states
  const [filters, setFilters] = useState({
    difficulty: '',
    category: '',
    tags: []
  })
  const [showFilters, setShowFilters] = useState(false)
  const [availableTags, setAvailableTags] = useState([])
  const [availableCategories, setAvailableCategories] = useState([])

  // Load examples index when modal opens
  useEffect(() => {
    if (isOpen) {
      loadExamplesIndex()
      setSelectedExample(null)
    }
  }, [isOpen])

  const loadExamplesIndex = async () => {
    setExamplesLoading(true)
    try {
      const response = await fetch('/examples/index.json')
      if (!response.ok) {
        throw new Error('Failed to load examples index')
      }
      const indexData = await response.json()
      setExamplesIndex(indexData)
      setExamples(indexData.examples)
      
      // Extract available tags and categories for filters
      const tags = new Set()
      const categories = new Set()
      
      indexData.examples.forEach(example => {
        example.tags.forEach(tag => tags.add(tag))
        categories.add(example.category)
      })
      
      setAvailableTags(Array.from(tags).sort())
      setAvailableCategories(Array.from(categories).sort())
    } catch (error) {
      console.error('Error loading examples index:', error)
      // Fallback to empty array if index fails to load
      setExamples([])
    } finally {
      setExamplesLoading(false)
    }
  }

  // Load thumbnail for a specific example (for preview)
  const loadThumbnail = useCallback(async (exampleId) => {
    if (thumbnailCache.current[exampleId] || thumbnails[exampleId]) {
      return
    }

    setThumbnailLoading(prev => ({ ...prev, [exampleId]: true }))

    try {
      const response = await fetch(`/examples/thumbnails/${exampleId}.svg`)
      if (!response.ok) {
        throw new Error(`Failed to load thumbnail: ${exampleId}.svg`)
      }
      
      const svgContent = await response.text()
      const thumbnail = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent)}`
      
      // Cache the thumbnail
      thumbnailCache.current[exampleId] = thumbnail
      
      setThumbnails(prev => ({ ...prev, [exampleId]: thumbnail }))
    } catch (error) {
      console.error(`Error loading thumbnail for ${exampleId}:`, error)
    } finally {
      setThumbnailLoading(prev => ({ ...prev, [exampleId]: false }))
    }
  }, [thumbnails])

  const handleLoadExample = async (example) => {
    setLoading(true)
    try {
      // Load the .cld file from the examples directory
      const response = await fetch(`/examples/${example.filename}`)
      if (!response.ok) {
        throw new Error(`Failed to load example file: ${example.filename}`)
      }
      
      const exampleData = await response.json()
      
      // Load the example into the store
      loadDiagramData(exampleData)
      console.log(`Successfully loaded example: ${example.name}`)
      onClose()
    } catch (error) {
      console.error('Error loading example:', error)
      alert('Failed to load example. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handlePreviewExample = (example) => {
    setSelectedExample(example)
    // Load thumbnail for preview if not already loaded
    if (!thumbnails[example.id] && !thumbnailCache.current[example.id]) {
      loadThumbnail(example.id)
    }
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return '#10b981'
      case 'intermediate': return '#f59e0b'
      case 'advanced': return '#ef4444'
      default: return '#6b7280'
    }
  }

  // Filter examples based on current filters
  const filteredExamples = examples.filter(example => {
    if (filters.difficulty && example.difficulty.toLowerCase() !== filters.difficulty.toLowerCase()) {
      return false
    }
    if (filters.category && example.category !== filters.category) {
      return false
    }
    if (filters.tags.length > 0) {
      const hasMatchingTag = filters.tags.some(tag => 
        example.tags.some(exampleTag => exampleTag.toLowerCase() === tag.toLowerCase())
      )
      if (!hasMatchingTag) {
        return false
      }
    }
    return true
  })

  const clearFilters = () => {
    setFilters({
      difficulty: '',
      category: '',
      tags: []
    })
  }

  const toggleTag = (tag) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) 
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }))
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.difficulty) count++
    if (filters.category) count++
    if (filters.tags.length > 0) count += filters.tags.length
    return count
  }

  if (!isOpen) return null

  return (
    <div className="examples-modal-overlay">
      <div className="examples-modal">
        {/* Header */}
        <div className="examples-modal-header">
          <div className="examples-modal-title-section">
            <Database size={20} className="examples-modal-icon" />
            <h2 className="examples-modal-title">
              Load Example
              {examplesLoading && <span className="loading-indicator">Loading...</span>}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="examples-modal-close"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="examples-tabs">
          <button
            className={`tab-button ${activeTab === 'default' ? 'active' : ''}`}
            onClick={() => setActiveTab('default')}
          >
            <Database size={16} />
            Default
          </button>
          <button
            className={`tab-button ${activeTab === 'cloud' ? 'active' : ''}`}
            onClick={() => setActiveTab('cloud')}
          >
            <Database size={16} />
            Cloud
          </button>
        </div>

        {/* Filters */}
        <div className="examples-filters">
          <div className="filters-header">
            <div className="filters-main">
              {/* Difficulty Filter */}
              <div className="filter-dropdown">
                <label>Difficulty</label>
                <select
                  value={filters.difficulty}
                  onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value }))}
                >
                  <option value="">All difficulties</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              {/* Category Filter */}
              <div className="filter-dropdown">
                <label>Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                >
                  <option value="">All categories</option>
                  {availableCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Tags Toggle */}
              <button
                className={`tags-toggle ${showFilters ? 'active' : ''}`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter size={16} />
                Tags
                {filters.tags.length > 0 && (
                  <span className="filter-count">{filters.tags.length}</span>
                )}
              </button>
            </div>
            
            {getActiveFiltersCount() > 0 && (
              <button className="clear-filters" onClick={clearFilters}>
                Clear all
              </button>
            )}
          </div>
          
          {showFilters && (
            <div className="filters-panel">
              {/* Tags Filter */}
              <div className="filter-group">
                <label>Tags</label>
                <div className="tags-filter">
                  {availableTags.map(tag => (
                    <button
                      key={tag}
                      className={`tag-filter ${filters.tags.includes(tag) ? 'active' : ''}`}
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                      {filters.tags.includes(tag) && <X size={12} />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="examples-modal-content">
          {activeTab === 'default' ? (
            examplesLoading ? (
              <div className="examples-loading">
                <div className="loading-spinner"></div>
                <p>Loading examples...</p>
              </div>
            ) : (
              <div className="examples-grid">
                {/* Examples List */}
                <div className="examples-list">
                  <div className="examples-list-header">
                    <h3>Available Examples</h3>
                    <div className="examples-header-right">
                      <span className="examples-count">{filteredExamples.length} examples</span>
                    </div>
                  </div>
                  
                  <div className="examples-items">
                    {filteredExamples.length === 0 ? (
                      <div className="no-results">
                        <p>No examples match your filters.</p>
                        <button onClick={clearFilters}>Clear filters</button>
                      </div>
                    ) : (
                      filteredExamples.map((example) => (
                        <div
                          key={example.id}
                          className={`example-item ${selectedExample?.id === example.id ? 'selected' : ''}`}
                          onClick={() => handlePreviewExample(example)}
                        >
                          <div className="example-item-content">
                            <div className="example-item-details">
                              <div className="example-item-header">
                                <h4 className="example-name">{example.name}</h4>
                                <span 
                                  className="example-difficulty"
                                  style={{ backgroundColor: getDifficultyColor(example.difficulty) }}
                                >
                                  {example.difficulty}
                                </span>
                              </div>
                              <p className="example-description">{example.description}</p>
                              <div className="example-meta">
                                <span className="example-category">{example.category}</span>
                                <div className="example-tags">
                                  {example.tags.slice(0, 2).map((tag, index) => (
                                    <span key={index} className="example-tag">{tag}</span>
                                  ))}
                                  {example.tags.length > 2 && (
                                    <span className="example-tag-more">+{example.tags.length - 2}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Example Preview */}
                <div className="example-preview">
                  {selectedExample ? (
                    <>
                      <div className="preview-header">
                        <h3>Preview</h3>
                      </div>
                      
                      <div className="preview-content">
                        <div className="preview-thumbnail">
                          {thumbnails[selectedExample.id] ? (
                            <img 
                              src={thumbnails[selectedExample.id]} 
                              alt={selectedExample.name}
                              style={{ 
                                width: '100%', 
                                height: 'auto', 
                                maxHeight: '200px',
                                borderRadius: '8px',
                                border: '1px solid #e5e7eb'
                              }}
                            />
                          ) : thumbnailLoading[selectedExample.id] ? (
                            <div className="preview-loading">
                              <div className="loading-spinner"></div>
                              <span>Loading Preview...</span>
                            </div>
                          ) : (
                            <div className="preview-placeholder">
                              <FileText size={48} />
                              <span>No Preview Available</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="preview-details">
                          <h4>{selectedExample.name}</h4>
                          <p>{selectedExample.description}</p>
                          
                          <div className="preview-meta">
                            <div className="preview-meta-item">
                              <strong>Category:</strong> {selectedExample.category}
                            </div>
                            <div className="preview-meta-item">
                              <strong>Difficulty:</strong> 
                              <span 
                                className="preview-difficulty"
                                style={{ backgroundColor: getDifficultyColor(selectedExample.difficulty) }}
                              >
                                {selectedExample.difficulty}
                              </span>
                            </div>
                            <div className="preview-meta-item">
                              <strong>Tags:</strong>
                              <div className="preview-tags">
                                {selectedExample.tags.map((tag, index) => (
                                  <span key={index} className="preview-tag">{tag}</span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="preview-actions">
                        <button
                          className="preview-button secondary"
                          onClick={() => setSelectedExample(null)}
                        >
                          Cancel
                        </button>
                        <button
                          className="preview-button primary"
                          onClick={() => handleLoadExample(selectedExample)}
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <div className="loading-spinner"></div>
                              Loading...
                            </>
                          ) : (
                            <>
                              <Download size={16} />
                              Load Example
                            </>
                          )}
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="preview-empty">
                      <Eye size={48} />
                      <h3>Select an Example</h3>
                      <p>Choose an example from the list to preview and load it into your workspace.</p>
                    </div>
                  )}
                </div>
              </div>
            )
          ) : (
            <div className="cloud-tab">
              <div className="cloud-placeholder">
                <Database size={48} />
                <h3>Cloud Examples</h3>
                <p>Browse examples from S3 bucket (coming soon)</p>
                <p className="cloud-note">This feature will allow you to access and load examples stored in the cloud.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ExamplesModal 