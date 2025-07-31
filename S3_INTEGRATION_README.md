# S3 Integration for CLD Studio

This document explains how to use the S3 integration features in CLD Studio.

## Features

### 1. S3 File Manager
- **Access**: Click the Database icon (🗄️) in the status bar
- **Functionality**:
  - Browse files in your S3 bucket
  - Upload new files
  - Download existing files
  - Delete files
  - Navigate through folders
  - View file details

### 2. Cloud Examples in Examples Modal
- **Access**: Open Examples modal and click the "Cloud" tab
- **Functionality**:
  - View .cld files stored in S3
  - Load cloud examples directly into the workspace
  - Refresh cloud examples list
  - Preview cloud examples

## Setup

### Prerequisites
1. Amplify backend is configured and deployed
2. S3 storage is set up with public read access
3. Frontend is configured with Amplify

### Current Configuration
- **S3 Bucket**: `amplify-cldstudio-kritika-cldstudiostoragebucketb4-td29m2clj3vg`
- **Region**: `us-east-1`
- **Access Level**: Public read access on `public/*` path

## Usage

### Uploading .cld Files to S3

1. **Using S3 File Manager**:
   - Click the Database icon in the status bar
   - Navigate to `public/examples/` folder
   - Click "Upload File" and select your .cld file
   - The file will be available in the Cloud Examples tab

2. **Using AWS Console**:
   - Go to your S3 bucket in AWS Console
   - Navigate to `public/examples/` folder
   - Upload .cld files directly

### Loading Cloud Examples

1. Open the Examples modal (File → Examples)
2. Click on the "Cloud" tab
3. Click on any cloud example to preview
4. Click "Load Example" to load it into your workspace

### File Structure
```
public/
├── examples/
│   ├── example1.cld
│   ├── example2.cld
│   └── subfolder/
│       └── example3.cld
└── other-files/
```

## File Format

Cloud examples should be in the same format as local examples:
- **File Extension**: `.cld`
- **Format**: JSON
- **Structure**: Compatible with CLD Studio's diagram format

## Troubleshooting

### Common Issues

1. **"No Cloud Examples Found"**
   - Check if files exist in `public/examples/` folder
   - Verify files have `.cld` extension
   - Ensure S3 bucket permissions are correct

2. **"Failed to load files from S3"**
   - Check Amplify configuration
   - Verify network connectivity
   - Check browser console for detailed errors

3. **"Failed to upload file"**
   - Check S3 bucket permissions
   - Verify file size limits
   - Ensure proper file format

### Debug Information

- Check browser console for detailed error messages
- Verify Amplify configuration in `src/main.jsx`
- Test S3 access using AWS Console

## Security Notes

- Files in `public/*` path are publicly readable
- Only upload files that are safe for public access
- Consider implementing authentication for sensitive files

## Future Enhancements

- [ ] Add authentication for private files
- [ ] Implement file versioning
- [ ] Add file search functionality
- [ ] Support for file metadata
- [ ] Bulk upload/download operations 