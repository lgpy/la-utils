import { NextRequest, NextResponse } from "next/server";

/**
 * API endpoint that serves as a middleman to the OCR service
 * Forwards image data to the OCR API defined in environment variables
 */
export async function POST(request: NextRequest) {
  try {
    // Get form data from the request
    const formData = await request.formData();

    // Get the OCR API URL from environment variables
    const ocrApiUrl = process.env.OCR_API;

    if (!ocrApiUrl) {
      return NextResponse.json(
        { error: "OCR API failed" },
        { status: 500 }
      );
    }

    // Forward the form data to the OCR API
    const response = await fetch(`${ocrApiUrl}/ocr`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.text();
      return NextResponse.json(
        { error: `OCR API error: ${errorData}` },
        { status: response.status }
      );
    }

    // Return the OCR API response to the client
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("OCR processing error:", error);
    return NextResponse.json(
      { error: "Failed to process OCR request" },
      { status: 500 }
    );
  }
}
