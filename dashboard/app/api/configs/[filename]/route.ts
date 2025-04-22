import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// GET /api/configs/[filename] - Get contents of a specific config file
export async function GET(
  request: Request,
  { params }: { params: { filename: string } }
) {
  try {
    const { filename } = params;
    
    // Basic security check to ensure we're only accessing JSON files
    if (!filename.endsWith('.json')) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JSON files are allowed.' },
        { status: 400 }
      );
    }
    
    // Prevent directory traversal attacks
    const sanitizedFilename = path.basename(filename);
    
    // Determine the project root directory (2 levels up from dashboard)
    const projectRoot = path.resolve(process.cwd(), '..');
    const filePath = path.join(projectRoot, sanitizedFilename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }
    
    // Read file content
    const content = fs.readFileSync(filePath, 'utf8');
    
    try {
      // Parse and return as JSON
      const jsonContent = JSON.parse(content);
      return NextResponse.json(jsonContent);
    } catch (parseError) {
      return NextResponse.json(
        { error: 'File is not valid JSON' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error(`Error reading file ${params.filename}:`, error);
    return NextResponse.json(
      { error: 'Failed to read file' },
      { status: 500 }
    );
  }
} 