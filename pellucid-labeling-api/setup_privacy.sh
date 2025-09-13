#!/bin/bash

echo "Setting up Pellucid Privacy Preservation Service..."

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Download spaCy English model
echo "Downloading spaCy English model..."
python -m spacy download en_core_web_sm

# Create environment file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cat > .env << EOF
# Privacy Service Configuration
PRIVACY_SECRET_KEY=$(python -c "import secrets; print(secrets.token_hex(32))")

# OpenAI API Key (for labeling service)
OPENAI_API_KEY=your_openai_api_key_here
EOF
    echo "Please update the .env file with your OpenAI API key"
fi

echo ""
echo "✅ Privacy Preservation Service setup complete!"
echo ""
echo "To start the service:"
echo "1. Activate virtual environment: source venv/bin/activate"
echo "2. Start privacy service: python privacy_service.py"
echo "3. Service will be available at: http://localhost:8001"
echo ""
echo "API Documentation: http://localhost:8001/docs"
echo ""
echo "Available endpoints:"
echo "- POST /anonymize - Anonymize text"
echo "- POST /batch-anonymize - Batch anonymize multiple texts"
echo "- GET /entities/detected - Detect entities without replacement"
echo "- GET /stats - Get service statistics"
echo "- GET /health - Health check"
