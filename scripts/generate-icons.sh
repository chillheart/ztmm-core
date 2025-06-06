#!/bin/zsh

# ZTMM Assessment Icon Generation Script
# This script generates all required icon formats from a source PNG file

set -e  # Exit on any error

echo "🎨 Generating app icons for ZTMM Assessment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root directory."
    exit 1
fi

# Look for source PNG file (try multiple possible names)
SOURCE_PNG=""
if [ -f "src/assets/icon.png" ]; then
    SOURCE_PNG="src/assets/icon.png"
elif [ -f "src/assets/app-icon.png" ]; then
    SOURCE_PNG="src/assets/app-icon.png"
elif [ -f "src/assets/logo.png" ]; then
    SOURCE_PNG="src/assets/logo.png"
else
    print_error "Source PNG icon not found. Please place your icon as one of:"
    echo "   • src/assets/icon.png"
    echo "   • src/assets/app-icon.png"
    echo "   • src/assets/logo.png"
    echo ""
    echo "The PNG should be at least 1024x1024 pixels for best results."
    exit 1
fi

print_status "Found source icon: $SOURCE_PNG"

# Check PNG dimensions
PNG_INFO=$(sips -g pixelWidth -g pixelHeight "$SOURCE_PNG")
WIDTH=$(echo "$PNG_INFO" | grep "pixelWidth" | awk '{print $2}')
HEIGHT=$(echo "$PNG_INFO" | grep "pixelHeight" | awk '{print $2}')

if [ "$WIDTH" != "$HEIGHT" ]; then
    print_warning "Icon is not square (${WIDTH}x${HEIGHT}). Results may be distorted."
fi

if [ "$WIDTH" -lt 512 ]; then
    print_warning "Icon resolution is low (${WIDTH}x${HEIGHT}). Recommend at least 1024x1024 for best results."
else
    print_success "Icon resolution: ${WIDTH}x${HEIGHT}"
fi

# Create necessary directories
mkdir -p src/assets/icons
mkdir -p build/icons

print_status "Generating icon sizes..."

# Generate various sizes for different platforms
declare -a sizes=(16 24 32 48 64 96 128 256 512 1024)
for size in "${sizes[@]}"; do
    if [ "$WIDTH" -ge "$size" ]; then
        sips -z $size $size "$SOURCE_PNG" --out "src/assets/icons/icon-${size}.png" &> /dev/null
        print_status "Generated ${size}x${size} icon"
    else
        print_warning "Skipping ${size}x${size} (source too small)"
    fi
done

print_success "All PNG icons generated"

# Generate favicon
print_status "Generating favicon..."
if [ "$WIDTH" -ge 32 ]; then
    sips -z 32 32 "$SOURCE_PNG" --out "public/favicon.ico" &> /dev/null
    print_success "Favicon updated"
else
    print_warning "Source too small for favicon"
fi

# For macOS .icns file, we need iconutil (available on macOS)
print_status "Creating macOS .icns file..."

# Create iconset directory structure
mkdir -p build/icons/icon.iconset

# Copy files with proper naming for iconutil
if [ -f "src/assets/icons/icon-16.png" ]; then
    cp "src/assets/icons/icon-16.png" "build/icons/icon.iconset/icon_16x16.png"
fi
if [ -f "src/assets/icons/icon-32.png" ]; then
    cp "src/assets/icons/icon-32.png" "build/icons/icon.iconset/icon_16x16@2x.png"
    cp "src/assets/icons/icon-32.png" "build/icons/icon.iconset/icon_32x32.png"
fi
if [ -f "src/assets/icons/icon-64.png" ]; then
    cp "src/assets/icons/icon-64.png" "build/icons/icon.iconset/icon_32x32@2x.png"
fi
if [ -f "src/assets/icons/icon-128.png" ]; then
    cp "src/assets/icons/icon-128.png" "build/icons/icon.iconset/icon_128x128.png"
fi
if [ -f "src/assets/icons/icon-256.png" ]; then
    cp "src/assets/icons/icon-256.png" "build/icons/icon.iconset/icon_128x128@2x.png"
    cp "src/assets/icons/icon-256.png" "build/icons/icon.iconset/icon_256x256.png"
fi
if [ -f "src/assets/icons/icon-512.png" ]; then
    cp "src/assets/icons/icon-512.png" "build/icons/icon.iconset/icon_256x256@2x.png"
    cp "src/assets/icons/icon-512.png" "build/icons/icon.iconset/icon_512x512.png"
fi
if [ -f "src/assets/icons/icon-1024.png" ]; then
    cp "src/assets/icons/icon-1024.png" "build/icons/icon.iconset/icon_512x512@2x.png"
fi

# Generate .icns file
if [ -f "build/icons/icon.iconset/icon_16x16.png" ]; then
    iconutil -c icns "build/icons/icon.iconset" -o "src/assets/icon.icns"
    print_success "macOS .icns file created"
else
    print_warning "Could not create .icns file (missing required sizes)"
fi

# Clean up iconset directory
rm -rf build/icons/icon.iconset

# For Windows .ico file
print_status "Creating Windows .ico file..."

# Check for available ICO creation tools
ICO_CREATED=false

# Method 1: Try ImageMagick (most reliable)
if command -v magick &> /dev/null; then
    print_status "Using ImageMagick to create ICO file..."
    
    # Create multi-resolution ICO file with common Windows icon sizes
    ICO_SIZES=""
    for size in 16 24 32 48 64 96 128 256; do
        if [ -f "src/assets/icons/icon-${size}.png" ]; then
            ICO_SIZES="$ICO_SIZES src/assets/icons/icon-${size}.png"
        fi
    done
    
    if [ -n "$ICO_SIZES" ]; then
        magick $ICO_SIZES "src/assets/icon.ico" 2>/dev/null
        if [ -f "src/assets/icon.ico" ]; then
            print_success "Windows .ico file created with ImageMagick (multi-resolution)"
            ICO_CREATED=true
        fi
    fi
    
elif command -v convert &> /dev/null; then
    print_status "Using ImageMagick convert to create ICO file..."
    
    # Create multi-resolution ICO file with common Windows icon sizes
    ICO_SIZES=""
    for size in 16 24 32 48 64 96 128 256; do
        if [ -f "src/assets/icons/icon-${size}.png" ]; then
            ICO_SIZES="$ICO_SIZES src/assets/icons/icon-${size}.png"
        fi
    done
    
    if [ -n "$ICO_SIZES" ]; then
        convert $ICO_SIZES "src/assets/icon.ico" 2>/dev/null
        if [ -f "src/assets/icon.ico" ]; then
            print_success "Windows .ico file created with ImageMagick convert (multi-resolution)"
            ICO_CREATED=true
        fi
    fi

# Method 2: Try png2ico (if available)
elif command -v png2ico &> /dev/null; then
    print_status "Using png2ico to create ICO file..."
    
    # Use multiple sizes for better quality
    PNG_FILES=""
    for size in 16 32 48 256; do
        if [ -f "src/assets/icons/icon-${size}.png" ]; then
            PNG_FILES="$PNG_FILES src/assets/icons/icon-${size}.png"
        fi
    done
    
    if [ -n "$PNG_FILES" ]; then
        png2ico "src/assets/icon.ico" $PNG_FILES 2>/dev/null
        if [ -f "src/assets/icon.ico" ]; then
            print_success "Windows .ico file created with png2ico"
            ICO_CREATED=true
        fi
    fi

# Method 3: Try icotool (from icoutils)
elif command -v icotool &> /dev/null; then
    print_status "Using icotool to create ICO file..."
    
    # Create multi-resolution ICO
    TEMP_ICOS=""
    for size in 16 32 48 256; do
        if [ -f "src/assets/icons/icon-${size}.png" ]; then
            icotool -c -o "temp-${size}.ico" "src/assets/icons/icon-${size}.png" 2>/dev/null
            if [ -f "temp-${size}.ico" ]; then
                TEMP_ICOS="$TEMP_ICOS temp-${size}.ico"
            fi
        fi
    done
    
    if [ -n "$TEMP_ICOS" ]; then
        # Combine into single ICO file
        icotool -c -o "src/assets/icon.ico" $TEMP_ICOS 2>/dev/null
        # Clean up temp files
        rm -f temp-*.ico
        if [ -f "src/assets/icon.ico" ]; then
            print_success "Windows .ico file created with icotool"
            ICO_CREATED=true
        fi
    fi
fi

# If no proper ICO tool available, provide instructions
if [ "$ICO_CREATED" = false ]; then
    print_warning "Could not create proper .ico file - no suitable tools found"
    print_warning "To fix this, install one of the following:"
    echo "   • ImageMagick: brew install imagemagick (macOS) or apt install imagemagick (Linux)"
    echo "   • png2ico: brew install png2ico (macOS)"
    echo "   • icoutils: brew install icoutils (macOS) or apt install icoutils (Linux)"
    echo ""
    echo "   Alternatively, use an online converter:"
    echo "   • https://convertio.co/png-ico/"
    echo "   • https://www.icoconverter.com/"
    echo ""
    print_status "Creating fallback PNG renamed as ICO (may not work properly)..."
    if [ -f "src/assets/icons/icon-256.png" ]; then
        cp "src/assets/icons/icon-256.png" "src/assets/icon.ico"
        print_warning "Created fallback icon.ico (PNG format) - consider using proper ICO format"
    fi
fi

# Update Angular favicon reference if needed
print_status "Checking Angular index.html..."
if [ -f "src/index.html" ]; then
    if grep -q "favicon.ico" src/index.html; then
        print_status "Favicon reference already exists in index.html"
    else
        # Add favicon link if it doesn't exist
        if grep -q "</head>" src/index.html; then
            sed -i '' 's|</head>|  <link rel="icon" type="image/x-icon" href="favicon.ico">\
</head>|' src/index.html
            print_success "Added favicon reference to index.html"
        fi
    fi
fi

echo ""
print_success "🎉 Icon generation completed!"
echo ""
echo "📁 Generated files:"
if [ -f "src/assets/icon.icns" ]; then
    echo "   ✅ src/assets/icon.icns (macOS)"
else
    echo "   ❌ src/assets/icon.icns (macOS) - failed"
fi
if [ -f "src/assets/icon.ico" ]; then
    echo "   ✅ src/assets/icon.ico (Windows)"
else
    echo "   ❌ src/assets/icon.ico (Windows) - failed"
fi
echo "   📁 src/assets/icons/ (various PNG sizes)"
if [ -f "public/favicon.ico" ]; then
    echo "   ✅ public/favicon.ico (web favicon)"
fi
echo ""
echo "📋 To use a custom icon:"
echo "   1. Place your PNG file as src/assets/icon.png (1024x1024 recommended)"
echo "   2. Run this script again: ./scripts/generate-icons.sh"
echo ""
echo "✅ Your app will now use the custom icon!"
