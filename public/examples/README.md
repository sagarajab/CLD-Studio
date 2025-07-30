# CLD Examples Directory

This directory contains example Causal Loop Diagram (CLD) files that can be loaded into the CLD Studio application.

## Structure

- `index.json` - Metadata index file listing all available examples
- `*.cld` - Individual example files in JSON format

## Adding New Examples

To add a new example:

1. **Create the .cld file**: Create a new JSON file with the `.cld` extension containing the diagram data
2. **Update the index**: Add the example metadata to `index.json`
3. **Generate thumbnail**: Run `node scripts/generate-thumbnails.js` to create a preview image
4. **Test**: Verify the example loads correctly in the application

### Example File Format

Each `.cld` file should follow this structure:

```json
{
  "version": "2.0",
  "diagramName": "Example Name",
  "description": "Brief description of the example",
  "category": "Category Name",
  "nodes": [
    {
      "id": "node1",
      "label": "Node Label",
      "type": "variable",
      "position": { "x": 200, "y": 150 },
      "color": "#3B82F6",
      "size": 60
    }
  ],
  "edges": [
    {
      "id": "edge1",
      "source": "node1",
      "target": "node2",
      "polarity": "positive",
      "type": "causal",
      "label": "Edge description"
    }
  ],
  "viewTransform": { "x": 0, "y": 0, "scale": 1 },
  "showGrid": true,
  "globalStyles": {
    "nodeColor": "#3B82F6",
    "edgeColor": "#6B7280",
    "backgroundColor": "#FFFFFF"
  },
  "problemStatement": {
    "mode": "sandbox",
    "currentProblem": null,
    "customStatement": "Problem statement or learning objective"
  },
  "analysis": {
    "adjacencyMatrix": [],
    "allLoops": []
  },
  "simulation": {
    "isInitialized": false,
    "timeStep": 1,
    "duration": 100
  }
}
```

### Index File Format

The `index.json` file contains metadata for all examples:

```json
{
  "examples": [
    {
      "id": "unique-example-id",
      "filename": "example-file.cld",
      "name": "Example Display Name",
      "description": "Brief description",
      "category": "Category Name",
      "difficulty": "Beginner|Intermediate|Advanced",
      "tags": ["tag1", "tag2", "tag3"]
    }
  ],
  "categories": [
    {
      "name": "Category Name",
      "description": "Category description"
    }
  ]
}
```

## Categories

Current categories include:
- **Basic Examples**: Simple models for beginners
- **Ecology**: Environmental and ecological systems
- **Business**: Business and market dynamics
- **Operations**: Operational and supply chain models

## Thumbnails

Thumbnail images are automatically generated for each example and stored in the `thumbnails/` directory. These are SVG files that provide a visual preview of the diagram structure.

To regenerate thumbnails after adding new examples:
```bash
node scripts/generate-thumbnails.js
```

## Future Integration

This directory structure is designed to be easily migrated to AWS S3 when the application is deployed, allowing for cloud-based example management and sharing. 