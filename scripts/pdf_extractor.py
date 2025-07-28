#!/usr/bin/env python3
import sys
import json
import PyPDF2
import os

def extract_pdf_text(pdf_path):
    """Extract text from a PDF file using PyPDF2"""
    try:
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            
            # Get basic info
            num_pages = len(pdf_reader.pages)
            
            # Extract text from all pages
            full_text = ""
            for page_num in range(num_pages):  # Extract all pages
                page = pdf_reader.pages[page_num]
                page_text = page.extract_text()
                full_text += f"\n--- Page {page_num + 1} ---\n{page_text}\n"
            
            # Get metadata
            metadata = {}
            if pdf_reader.metadata:
                for key, value in pdf_reader.metadata.items():
                    if value:
                        metadata[key] = str(value)
            
            result = {
                "success": True,
                "text": full_text,
                "num_pages": num_pages,
                "metadata": metadata
            }
            
            print(json.dumps(result))
            
    except Exception as e:
        error_result = {
            "success": False,
            "error": str(e)
        }
        print(json.dumps(error_result))

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(json.dumps({"success": False, "error": "Usage: python pdf_extractor.py <pdf_path>"}))
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    if not os.path.exists(pdf_path):
        print(json.dumps({"success": False, "error": f"File not found: {pdf_path}"}))
        sys.exit(1)
    
    extract_pdf_text(pdf_path) 