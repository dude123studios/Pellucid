#!/bin/bash

# Pellucid AI Alignment Data Marketplace - Complete Startup Script
# This script starts all services: Python APIs and Next.js frontend

set -e  # Exit on any error

echo "🚀 Starting Pellucid AI Alignment Data Marketplace..."
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -d "pellucid-marketplace" ] || [ ! -d "pellucid-labeling-api" ]; then
    print_error "Please run this script from the hackcmu directory"
    print_error "Expected structure: hackcmu/pellucid-marketplace and hackcmu/pellucid-labeling-api"
    exit 1
fi

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to kill processes on specific ports
kill_port() {
    local port=$1
    local service_name=$2
    if check_port $port; then
        print_warning "Port $port is already in use. Killing existing $service_name..."
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
}

# Clean up any existing processes
print_status "Cleaning up existing processes..."
kill_port 3000 "Next.js"
kill_port 8000 "Python Labeling API"
kill_port 8001 "Python Privacy Service"
kill_port 8002 "Python Visualization Service"

# Check Python installation
print_status "Checking Python installation..."
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

# Check Node.js installation
print_status "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if virtual environment exists for Python services
if [ ! -d "pellucid-labeling-api/venv" ]; then
    print_warning "Python virtual environment not found. Creating one..."
    cd pellucid-labeling-api
    python3 -m venv venv
    source venv/bin/activate
    pip install --upgrade pip
    pip install -r requirements.txt
    cd ..
    print_success "Python virtual environment created and dependencies installed"
fi

# Start Python services
print_status "Starting Python backend services..."

# Start Python Labeling API (port 8000)
print_status "Starting Python Labeling API on port 8000..."
cd pellucid-labeling-api
source venv/bin/activate
python main.py &
LABELING_PID=$!
cd ..

# Start Python Privacy Service (port 8001)
print_status "Starting Python Privacy Service on port 8001..."
cd pellucid-labeling-api
source venv/bin/activate
python privacy_service.py &
PRIVACY_PID=$!
cd ..

# Start Python Visualization Service (port 8002)
print_status "Starting Python Visualization Service on port 8002..."
cd pellucid-labeling-api
source venv/bin/activate
python visualization_service.py &
VISUALIZATION_PID=$!
cd ..

# Wait a moment for Python services to start
print_status "Waiting for Python services to initialize..."
sleep 5

# Check if Python services are running
check_python_services() {
    local all_running=true
    
    if ! check_port 8000; then
        print_error "Python Labeling API (port 8000) failed to start"
        all_running=false
    fi
    
    if ! check_port 8001; then
        print_error "Python Privacy Service (port 8001) failed to start"
        all_running=false
    fi
    
    if ! check_port 8002; then
        print_error "Python Visualization Service (port 8002) failed to start"
        all_running=false
    fi
    
    if [ "$all_running" = true ]; then
        print_success "All Python services are running!"
        return 0
    else
        return 1
    fi
}

if ! check_python_services; then
    print_error "Some Python services failed to start. Check the logs above."
    print_status "Killing any partially started services..."
    kill $LABELING_PID 2>/dev/null || true
    kill $PRIVACY_PID 2>/dev/null || true
    kill $VISUALIZATION_PID 2>/dev/null || true
    exit 1
fi

# Start Next.js frontend
print_status "Starting Next.js frontend on port 3000..."
cd pellucid-marketplace

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_warning "Node modules not found. Installing dependencies..."
    npm install
fi

# Start Next.js in development mode
npm run dev &
NEXTJS_PID=$!
cd ..

# Wait for Next.js to start
print_status "Waiting for Next.js to initialize..."
sleep 10

# Check if Next.js is running
if check_port 3000; then
    print_success "Next.js frontend is running!"
else
    print_error "Next.js frontend failed to start"
    kill $NEXTJS_PID 2>/dev/null || true
    exit 1
fi

# Success message
echo ""
echo "🎉 All services started successfully!"
echo "=================================================="
echo -e "${GREEN}✅ Python Labeling API:${NC}     http://localhost:8000"
echo -e "${GREEN}✅ Python Privacy Service:${NC}  http://localhost:8001"
echo -e "${GREEN}✅ Python Visualization:${NC}    http://localhost:8002"
echo -e "${GREEN}✅ Next.js Frontend:${NC}        http://localhost:3000"
echo ""
echo -e "${CYAN}📊 Visualization Demo:${NC}      http://localhost:3000/visualization-demo"
echo -e "${CYAN}🏪 Marketplace:${NC}             http://localhost:3000/marketplace"
echo -e "${CYAN}📈 Dashboard:${NC}               http://localhost:3000/dashboard"
echo -e "${CYAN}🔐 Auth:${NC}                    http://localhost:3000/auth"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    print_status "Shutting down all services..."
    
    # Kill Next.js
    if [ ! -z "$NEXTJS_PID" ]; then
        kill $NEXTJS_PID 2>/dev/null || true
        print_status "Stopped Next.js frontend"
    fi
    
    # Kill Python services
    if [ ! -z "$LABELING_PID" ]; then
        kill $LABELING_PID 2>/dev/null || true
        print_status "Stopped Python Labeling API"
    fi
    
    if [ ! -z "$PRIVACY_PID" ]; then
        kill $PRIVACY_PID 2>/dev/null || true
        print_status "Stopped Python Privacy Service"
    fi
    
    if [ ! -z "$VISUALIZATION_PID" ]; then
        kill $VISUALIZATION_PID 2>/dev/null || true
        print_status "Stopped Python Visualization Service"
    fi
    
    # Clean up any remaining processes on our ports
    kill_port 3000 "Next.js"
    kill_port 8000 "Python Labeling API"
    kill_port 8001 "Python Privacy Service"
    kill_port 8002 "Python Visualization Service"
    
    print_success "All services stopped. Goodbye! 👋"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Keep the script running and show status
while true; do
    sleep 30
    echo -e "${BLUE}[STATUS]${NC} All services still running... $(date)"
done
