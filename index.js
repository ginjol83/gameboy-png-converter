const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

// Game Boy color palette (4 shades of green)
const GAMEBOY_PALETTE = [
    { r: 155, g: 188, b: 15 },   // Lightest green
    { r: 139, g: 172, b: 15 },   // Light green
    { r: 48, g: 98, b: 48 },     // Dark green
    { r: 15, g: 56, b: 15 }      // Darkest green
];

/**
 * Calculates the Euclidean distance between two RGB colors
 */
function colorDistance(color1, color2) {
    const dr = color1.r - color2.r;
    const dg = color1.g - color2.g;
    const db = color1.b - color2.b;
    return Math.sqrt(dr * dr + dg * dg + db * db);
}

/**
 * Finds the closest color in the Game Boy palette
 */
function findClosestGameBoyColor(r, g, b) {
    let minDistance = Infinity;
    let closestColor = GAMEBOY_PALETTE[0];
    
    for (const paletteColor of GAMEBOY_PALETTE) {
        const distance = colorDistance({ r, g, b }, paletteColor);
        if (distance < minDistance) {
            minDistance = distance;
            closestColor = paletteColor;
        }
    }
    
    return closestColor;
}

/**
 * Converts a PNG image to Game Boy palette
 */
async function convertToGameBoy(inputPath, outputPath) {
    try {
        // Load the image
        const image = await loadImage(inputPath);
        
        console.log(`📏 Processing ${image.width}x${image.height} pixel image`);
        
        // Create canvas to process the image (use original size)
        const canvas = createCanvas(image.width, image.height);
        const ctx = canvas.getContext('2d');
        
        // Draw the original image
        ctx.drawImage(image, 0, 0);
        
        // Get pixel data (use original dimensions)
        const imageData = ctx.getImageData(0, 0, image.width, image.height);
        const data = imageData.data;
        
        // Convert each pixel to Game Boy palette
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            // data[i + 3] is the alpha channel, we keep it
            
            // Find the closest color in the palette
            const gameBoyColor = findClosestGameBoyColor(r, g, b);
            
            // Replace the color
            data[i] = gameBoyColor.r;
            data[i + 1] = gameBoyColor.g;
            data[i + 2] = gameBoyColor.b;
            // Keep the original alpha channel
        }
        
        // Apply the new pixel data
        ctx.putImageData(imageData, 0, 0);
        
        // Save the converted image
        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync(outputPath, buffer);
        
        console.log(`✅ Image successfully converted: ${outputPath}`);
        
    } catch (error) {
        console.error(`❌ Error converting image: ${error.message}`);
    }
}

/**
 * Converts Game Boy colors to 2-bit values for GBDK
 */
function colorToGBDKValue(r, g, b) {
    // Map Game Boy colors to 2-bit values (0-3)
    if (r === 155 && g === 188 && b === 15) return 0; // Lightest green
    if (r === 139 && g === 172 && b === 15) return 1; // Light green  
    if (r === 48 && g === 98 && b === 48) return 2;   // Dark green
    if (r === 15 && g === 56 && b === 15) return 3;   // Darkest green
    return 0; // Default
}

/**
 * Generates C code for GBDK from a converted image
 */
async function generateGBDKCode(imagePath, outputPath) {
    try {
        const image = await loadImage(imagePath);
        const canvas = createCanvas(image.width, image.height);
        const ctx = canvas.getContext('2d');
        
        ctx.drawImage(image, 0, 0);
        const imageData = ctx.getImageData(0, 0, image.width, image.height);
        const data = imageData.data;
        
        // Calculate dimensions in tiles (8x8 pixels each)
        const tileWidth = Math.ceil(image.width / 8);
        const tileHeight = Math.ceil(image.height / 8);
        
        let gbdkCode = '';
        gbdkCode += `// Automatically generated Sprite/Tile\n`;
        gbdkCode += `// Dimensions: ${image.width}x${image.height} pixels (${tileWidth}x${tileHeight} tiles)\n`;
        gbdkCode += `// Generated on: ${new Date().toISOString()}\n\n`;
        
        const baseName = path.parse(imagePath).name.replace(/[^a-zA-Z0-9]/g, '_');
        
        // Generate tile data
        gbdkCode += `#include <gb/gb.h>\n\n`;
        gbdkCode += `// Sprite/tile data\n`;
        gbdkCode += `const unsigned char ${baseName}_data[] = {\n`;
        
        const tiles = [];
        
        // Process image tile by tile (8x8)
        for (let tileY = 0; tileY < tileHeight; tileY++) {
            for (let tileX = 0; tileX < tileWidth; tileX++) {
                const tileData = [];
                
                // Process each row of the tile (8 pixels)
                for (let row = 0; row < 8; row++) {
                    let lowByte = 0;
                    let highByte = 0;
                    
                    for (let col = 0; col < 8; col++) {
                        const pixelX = tileX * 8 + col;
                        const pixelY = tileY * 8 + row;
                        
                        if (pixelX < image.width && pixelY < image.height) {
                            const pixelIndex = (pixelY * image.width + pixelX) * 4;
                            const r = data[pixelIndex];
                            const g = data[pixelIndex + 1];
                            const b = data[pixelIndex + 2];
                            
                            const colorValue = colorToGBDKValue(r, g, b);
                            
                            // Game Boy uses 2 bits per pixel, divided into two bytes
                            const bit = 7 - col;
                            if (colorValue & 1) lowByte |= (1 << bit);
                            if (colorValue & 2) highByte |= (1 << bit);
                        }
                    }
                    
                    tileData.push(lowByte, highByte);
                }
                tiles.push(...tileData);
            }
        }
        
        // Write data in hexadecimal format
        for (let i = 0; i < tiles.length; i += 8) {
            gbdkCode += '    ';
            for (let j = 0; j < 8 && i + j < tiles.length; j++) {
                gbdkCode += `0x${tiles[i + j].toString(16).padStart(2, '0').toUpperCase()}`;
                if (i + j < tiles.length - 1) gbdkCode += ', ';
            }
            gbdkCode += '\n';
        }
        
        gbdkCode += `};\n\n`;
        
        // Add useful information
        gbdkCode += `// Sprite/tile information:\n`;
        gbdkCode += `#define ${baseName.toUpperCase()}_WIDTH ${image.width}\n`;
        gbdkCode += `#define ${baseName.toUpperCase()}_HEIGHT ${image.height}\n`;
        gbdkCode += `#define ${baseName.toUpperCase()}_TILE_WIDTH ${tileWidth}\n`;
        gbdkCode += `#define ${baseName.toUpperCase()}_TILE_HEIGHT ${tileHeight}\n`;
        gbdkCode += `#define ${baseName.toUpperCase()}_SIZE ${tiles.length}\n\n`;
        
        // Add usage example
        gbdkCode += `// Usage example:\n`;
        gbdkCode += `// set_sprite_data(0, ${tileWidth * tileHeight}, ${baseName}_data);\n`;
        gbdkCode += `// set_sprite_tile(0, 0); // To use the first tile\n`;
        
        // Save file
        fs.writeFileSync(outputPath, gbdkCode);
        console.log(`🎮 GBDK code generated: ${outputPath}`);
        console.log(`📊 Tiles generated: ${tileWidth * tileHeight} (${tileWidth}x${tileHeight})`);
        
    } catch (error) {
        console.error(`❌ Error generating GBDK code: ${error.message}`);
    }
}

/**
 * Main function
 */
async function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log('🎮 PNG to Game Boy palette converter');
        console.log('');
        console.log('Usage:');
        console.log('  node index.js <input_file.png> [output_file.png] [--gbdk]');
        console.log('');
        console.log('Options:');
        console.log('  --gbdk    Also generates C code for GBDK');
        console.log('');
        console.log('Examples:');
        console.log('  node index.js image.png');
        console.log('  node index.js image.png gameboy_image.png');
        console.log('  node index.js image.png --gbdk');
        console.log('  node index.js image.png gameboy_image.png --gbdk');
        console.log('');
        console.log('Note: Accepts PNG images of any size');
        return;
    }
    
    // Check if GBDK code generation is requested
    const generateGBDK = args.includes('--gbdk');
    const filteredArgs = args.filter(arg => arg !== '--gbdk');
    
    const inputPath = filteredArgs[0];
    let outputPath = filteredArgs[1];
    
    // If no output file is specified, generate one automatically
    if (!outputPath) {
        const parsedPath = path.parse(inputPath);
        outputPath = path.join(parsedPath.dir, `${parsedPath.name}_gameboy${parsedPath.ext}`);
    }
    
    // Verify that the input file exists
    if (!fs.existsSync(inputPath)) {
        console.error(`❌ File does not exist: ${inputPath}`);
        return;
    }
    
    // Verify that it's a PNG file
    if (!inputPath.toLowerCase().endsWith('.png')) {
        console.error('❌ File must be a PNG image');
        return;
    }
    
    console.log(`🔄 Converting ${inputPath} to Game Boy palette...`);
    await convertToGameBoy(inputPath, outputPath);
    
    // Generate GBDK code if requested
    if (generateGBDK) {
        console.log('🎮 Generating GBDK code...');
        const parsedPath = path.parse(outputPath);
        const gbdkPath = path.join(parsedPath.dir, `${parsedPath.name}.c`);
        await generateGBDKCode(outputPath, gbdkPath);
    }
}

// Run the application
main().catch(console.error);
