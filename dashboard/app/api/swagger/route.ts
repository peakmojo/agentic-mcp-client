import { NextResponse } from 'next/server';
import { getApiDocs } from '../../../swagger';

// GET /api/swagger - Get the OpenAPI specification
export async function GET() {
  try {
    const spec = getApiDocs();
    return NextResponse.json(spec);
  } catch (error) {
    console.error('Error generating API documentation:', error);
    return NextResponse.json(
      { error: 'Failed to generate API documentation' },
      { status: 500 }
    );
  }
} 