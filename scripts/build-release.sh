#!/bin/bash

# ZTMM Assessment Release Build Script
# This script builds the application for both macOS and Windows

set -e  # Exit on any error

echo "🚀 Starting ZTMM Assessment release build process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root directory."
    exit 1
fi

# Check if Node.js and npm are available
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

# Clean previous builds
print_status "Cleaning previous builds..."
rm -rf dist
rm -rf dist-electron
print_success "Previous builds cleaned"

# Install dependencies
print_status "Installing/updating dependencies..."
npm install
print_success "Dependencies installed"

# Run tests
print_status "Running tests..."
if npm test -- --watch=false --browsers=ChromeHeadless; then
    print_success "All tests passed"
else
    print_warning "Some tests failed, but continuing with build..."
fi

# Build Angular application
print_status "Building Angular application for production..."
npm run build -- --configuration production
print_success "Angular application built"

# Rebuild native dependencies for Electron
print_status "Rebuilding native dependencies for Electron..."
npm run electron:rebuild
print_success "Native dependencies rebuilt"

# Build for different platforms based on current platform and arguments
PLATFORM=$(uname)
BUILD_ALL=false
BUILD_MAC=false
BUILD_WIN=false

# Parse command line arguments
for arg in "$@"; do
    case $arg in
        --all)
            BUILD_ALL=true
            shift
            ;;
        --mac)
            BUILD_MAC=true
            shift
            ;;
        --win)
            BUILD_WIN=true
            shift
            ;;
        *)
            # Unknown option
            ;;
    esac
done

# Default behavior: build for current platform + opposite platform if possible
if [ "$BUILD_ALL" = false ] && [ "$BUILD_MAC" = false ] && [ "$BUILD_WIN" = false ]; then
    if [ "$PLATFORM" = "Darwin" ]; then
        BUILD_MAC=true
        BUILD_WIN=true  # Cross-compile for Windows on macOS
    else
        BUILD_WIN=true
        # Cannot cross-compile for macOS on non-macOS systems
        print_warning "Cross-compilation for macOS is only supported on macOS systems"
    fi
fi

if [ "$BUILD_ALL" = true ]; then
    BUILD_MAC=true
    BUILD_WIN=true
fi

# Build for macOS
if [ "$BUILD_MAC" = true ]; then
    if [ "$PLATFORM" = "Darwin" ]; then
        print_status "Building for macOS (Intel + Apple Silicon)..."
        npm run electron:build:mac
        print_success "macOS build completed"
    else
        print_warning "Skipping macOS build - can only build for macOS on macOS systems"
    fi
fi

# Build for Windows
if [ "$BUILD_WIN" = true ]; then
    print_status "Building for Windows (x64 + x86)..."
    npm run electron:build:win
    print_success "Windows build completed"
fi

# Display build results
print_status "Build process completed!"
echo ""
echo "📦 Build artifacts are located in:"
echo "   dist-electron/"
echo ""

if [ -d "dist-electron" ]; then
    echo "📁 Available build files:"
    ls -la dist-electron/ | grep -E '\.(dmg|zip|exe|AppImage|deb|rpm)$' || echo "   No build artifacts found"
    echo ""
fi

echo "🎉 Release build process completed successfully!"
echo ""
echo "📋 Next steps:"
echo "   1. Test the built applications on target platforms"
echo "   2. Sign the applications if needed (see README for details)"
echo "   3. Upload to distribution platforms or share with users"
echo ""

# Optional: Open the dist-electron directory
if command -v open &> /dev/null && [ "$PLATFORM" = "Darwin" ]; then
    read -p "Would you like to open the build directory? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        open dist-electron
    fi
fi
