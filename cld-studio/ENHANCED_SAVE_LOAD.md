# Enhanced Save/Load Functionality

## Overview

The CLD Studio now supports enhanced save/load functionality with comprehensive metadata capture and backward compatibility.

## New Features

### Enhanced Save Format (v2.0)

The new save format includes:

1. **Problem Statement & Context**
   - Mode (sandbox/assessment)
   - Current problem information
   - Custom problem description from sidebar

2. **Complete Node Information**
   - Position, label, type, color
   - Description and value
   - All custom properties

3. **Complete Edge Information**
   - Source, target, polarity
   - Color, width, transparency, radius
   - Description and styling

4. **View & Layout**
   - View transform (zoom, pan)
   - Grid visibility

5. **Global Styling**
   - Font settings
   - Arrow properties
   - Color preferences

6. **Analysis Data**
   - Adjacency matrix
   - Detected loops with descriptions
   - Node/edge statistics

7. **Simulation State** (if running)
   - Current step, values
   - History and state vectors
   - Perturbation information

8. **Configuration Snapshot**
   - Constraints and settings
   - Color palettes
   - Performance options

9. **Metadata**
   - Node type distribution
   - Edge polarity counts
   - Loop statistics

### Backward Compatibility

- **Legacy Format (v1.0)**: Still supported for loading old files
- **Enhanced Format (v2.0)**: New comprehensive format
- **Auto-detection**: Automatically detects format version

## Export Options

### 1. Save Diagram (.cld)
- Standard save with all metadata
- Compatible with CLD Studio
- Includes problem statement and analysis

### 2. Export Detailed Data (.json)
- Comprehensive analysis export
- Includes graph analysis metrics
- Node degree distribution
- Loop analysis with statistics
- Suitable for external analysis tools

### 3. Export Matrix (.csv)
- Adjacency matrix in CSV format
- Compatible with external analysis tools

### 4. Visual Exports
- PNG, SVG, PDF formats
- High-quality diagram images

## Usage

### Saving
1. Use "Save Diagram" to save in enhanced format
2. Use "Export Detailed Data" for analysis purposes
3. Files are automatically saved with `.cld` extension

### Loading
1. Use "Load Diagram" to open any supported format
2. Enhanced format files restore all metadata
3. Legacy files load basic diagram data only

### Problem Statement
- In sandbox mode: Edit problem statement in sidebar
- In assessment mode: Automatically captures problem context
- Saved and restored with diagram

## File Structure Example

```json
{
  "diagramName": "My CLD",
  "version": "2.0",
  "createdWith": "CLD Studio",
  "problemStatement": {
    "mode": "sandbox",
    "description": "Custom problem description",
    "customStatement": "User-defined problem text"
  },
  "nodes": [...],
  "edges": [...],
  "viewTransform": {...},
  "globalStyles": {...},
  "analysis": {...},
  "simulation": {...},
  "config": {...},
  "metadata": {...}
}
```

## Benefits

1. **Complete Preservation**: All diagram information is saved
2. **Analysis Ready**: Detailed data for external analysis
3. **Collaboration**: Share complete diagrams with context
4. **Research**: Export data for academic/research purposes
5. **Backup**: Comprehensive backup of all settings and state

## Technical Details

- **Version Detection**: Automatic format detection
- **Error Handling**: Graceful fallback for corrupted files
- **Performance**: Efficient loading with async analysis updates
- **Extensibility**: Easy to add new metadata fields 