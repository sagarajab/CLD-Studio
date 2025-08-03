#!/usr/bin/env node

/**
 * Test script to check assignment file access
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log('🧪 Testing Assignment File Access\n')

// Test 1: Check if assignment files exist
console.log('📝 Test 1: Assignment File Existence')
try {
  const assignmentsDir = path.join(__dirname, '../public/assignments')
  const files = fs.readdirSync(assignmentsDir)
  const cldqFiles = files.filter(file => file.endsWith('.cldq'))
  
  console.log(`Found ${cldqFiles.length} .cldq files:`, cldqFiles)
  
  if (cldqFiles.includes('sample-assignment.cldq')) {
    console.log('✅ sample-assignment.cldq exists')
  } else {
    console.log('❌ sample-assignment.cldq not found')
  }
  
} catch (error) {
  console.log('❌ Error checking assignment files:', error.message)
}

// Test 2: Check sample assignment file content
console.log('\n📝 Test 2: Sample Assignment File Content')
try {
  const samplePath = path.join(__dirname, '../public/assignments/sample-assignment.cldq')
  const content = fs.readFileSync(samplePath, 'utf8')
  
  console.log('File size:', content.length, 'characters')
  console.log('First 100 characters:', content.substring(0, 100))
  console.log('Last 100 characters:', content.substring(content.length - 100))
  
  // Try to parse as JSON
  try {
    const parsed = JSON.parse(content)
    console.log('✅ File is valid JSON')
    console.log('Assignment ID:', parsed.id)
    console.log('Assignment title:', parsed.title)
    console.log('Number of questions:', parsed.questions?.length || 0)
  } catch (parseError) {
    console.log('❌ File is not valid JSON:', parseError.message)
  }
  
} catch (error) {
  console.log('❌ Error reading sample assignment file:', error.message)
}

// Test 3: Check for potential file encoding issues
console.log('\n📝 Test 3: File Encoding Check')
try {
  const samplePath = path.join(__dirname, '../public/assignments/sample-assignment.cldq')
  const buffer = fs.readFileSync(samplePath)
  
  console.log('File buffer length:', buffer.length)
  console.log('First 10 bytes:', Array.from(buffer.slice(0, 10)).map(b => b.toString(16).padStart(2, '0')).join(' '))
  
  // Check for BOM (Byte Order Mark)
  if (buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
    console.log('⚠️  File has UTF-8 BOM - this might cause JSON parsing issues')
  } else {
    console.log('✅ No BOM detected')
  }
  
} catch (error) {
  console.log('❌ Error checking file encoding:', error.message)
}

// Test 4: Check if development server can serve the file
console.log('\n📝 Test 4: Development Server File Access')
console.log('To test this manually:')
console.log('1. Start development server: npm run dev')
console.log('2. Open browser to: http://localhost:3002/assignments/sample-assignment.cldq')
console.log('3. Check if the file loads properly')
console.log('4. Check browser network tab for any errors')

console.log('\n📋 Expected Results:')
console.log('- Assignment files should exist in public/assignments/')
console.log('- Files should be valid JSON')
console.log('- No BOM should be present')
console.log('- Development server should serve files correctly') 