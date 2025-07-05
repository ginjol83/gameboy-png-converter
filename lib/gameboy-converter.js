import { createCanvas, loadImage } from 'canvas'
import fs from 'fs'
import path from 'path'

// Game Boy color palette (4 shades of green)
const GAMEBOY_PALETTE = [
    { r: 155, g: 188, b: 15 },   // Lightest green
    { r: 139, g: 172, b: 15 },   // Light green
    { r: 48, g: 98, b: 48 },     // Dark green
    { r: 15, g: 56, b: 15 }      // Darkest green
]

/**
 * Calculates the Euclidean distance between two RGB colors
 * @param {Object} color1 - RGB color {r, g, b}
 * @param {Object} color2 - RGB color {r, g, b}
 * @returns {number} Euclidean distance
 */
const colorDistance = (color1, color2) => {
    const redDistance = color1.r - color2.r
    const greenDistance = color1.g - color2.g
    const blueDistance = color1.b - color2.b

    return Math.sqrt(
        redDistance * redDistance + 
        greenDistance * greenDistance + 
        blueDistance * blueDistance
    )
}

/**
 * Finds the closest color in the Game Boy palette
 * @param {number} r - Red component (0-255)
 * @param {number} g - Green component (0-255)
 * @param {number} b - Blue component (0-255)
 * @returns {Object} Closest color {r, g, b}
 */
const findClosestGameBoyColor = (r, g, b) => {
    return GAMEBOY_PALETTE.reduce((closest, paletteColor) => {
        const currentDistance = colorDistance({ r, g, b }, paletteColor)
        const closestDistance = colorDistance({ r, g, b }, closest)
        
        return currentDistance < closestDistance ? paletteColor : closest
    })
}

/**
 * Converts Game Boy colors to 2-bit values for GBDK
 * @param {number} r - Red component
 * @param {number} g - Green component
 * @param {number} b - Blue component
 * @returns {number} 2-bit value (0-3)
 */
const colorToGBDKValue = (r, g, b) => {
    // Map Game Boy colors to 2-bit values (0-3)
    if (r === 155 && g === 188 && b === 15) return 0 // Lightest green
    if (r === 139 && g === 172 && b === 15) return 1 // Light green  
    if (r === 48  && g === 98  && b === 48) return 2 // Dark green
    if (r === 15  && g === 56  && b === 15) return 3 // Darkest green
    return 0 // Default
}

/**
 * Converts a PNG image to Game Boy palette
 * @param {string} inputPath - Input file path
 * @param {string} outputPath - Output file path
 * @param {Object} options - Additional options
 * @param {boolean} options.verbose - Show detailed information
 * @returns {Promise<Object>} Information about the conversion
 */
const convertToGameBoy = async (inputPath, outputPath, options = {}) => {
    const { verbose = true } = options
    
    try {
        // Load the image
        const image = await loadImage(inputPath)
        
        verbose && console.log(`📏 Processing ${image.width}x${image.height} pixel image`)
        
        // Create canvas to process the image (use original size)
        const canvas = createCanvas(image.width, image.height)
        const ctx    = canvas.getContext('2d')
        
        // Draw the original image
        ctx.drawImage(image, 0, 0)
        
        // Get pixel data (use original dimensions)
        const imageData = ctx.getImageData(0, 0, image.width, image.height)
        const data = imageData.data
        
        // Convert each pixel to Game Boy palette (functional approach)
        const convertedData = new Uint8ClampedArray(
            Array.from({ length: data.length / 4 }, (_, pixelIndex) => {
                const i = pixelIndex * 4
                const r = data[i]
                const g = data[i + 1]
                const b = data[i + 2]
                const alpha = data[i + 3] // Keep original alpha
                
                // Find the closest color in the palette
                const gameBoyColor = findClosestGameBoyColor(r, g, b)
                
                // Return new RGBA values
                return [gameBoyColor.r, gameBoyColor.g, gameBoyColor.b, alpha]
            }).flat()
        )

        // Create new ImageData with converted pixels
        const newImageData = new ImageData(convertedData, image.width, image.height)
        
        // Apply the new pixel data
        ctx.putImageData(newImageData, 0, 0)
        
        // Save the converted image
        const buffer = canvas.toBuffer('image/png')
        fs.writeFileSync(outputPath, buffer)
        
        verbose && console.log(`✅ Image successfully converted: ${outputPath}`)
                
        return {
            success: true,
            inputPath,
            outputPath,
            width: image.width,
            height: image.height,
            message: `Image successfully converted: ${outputPath}`
        }
        
    } catch (error) {
        const errorMessage = `Error converting image: ${error.message}`
        
        verbose && console.error(`❌ ${errorMessage}`)
        
        return {
            success: false,
            error: errorMessage,
            inputPath,
            outputPath
        }
    }
}

/**
 * Generates C code for GBDK from a converted image
 * @param {string} imagePath - Path of the converted image
 * @param {string} outputPath - Path of the C code file
 * @param {Object} options - Additional options
 * @param {boolean} options.verbose - Show detailed information
 * @param {string} options.variableName - Custom name for the variable
 * @returns {Promise<Object>} Information about the generation
 */
const generateGBDKCode = async (imagePath, outputPath, options = {}) => {
    const { verbose = true, variableName } = options
    
    try {
        const image = await loadImage(imagePath)
        const canvas = createCanvas(image.width, image.height)
        const ctx = canvas.getContext('2d')
        
        ctx.drawImage(image, 0, 0)
        const imageData = ctx.getImageData(0, 0, image.width, image.height)
        const data = imageData.data
        
        // Calculate dimensions in tiles (8x8 pixels each)
        const tileWidth = Math.ceil(image.width / 8)
        const tileHeight = Math.ceil(image.height / 8)
        
        // Generate base name for variables (functional approach)
        const baseName = variableName || path.parse(imagePath).name.replace(/[^a-zA-Z0-9]/g, '_')

        // Generate tile data using functional approach
        const tiles = Array.from({ length: tileHeight }, (_, tileY) =>
            Array.from({ length: tileWidth }, (_, tileX) =>
                Array.from({ length: 8 }, (_, row) => {
                    const { lowByte, highByte } = Array.from({ length: 8 }, (_, col) => {
                        const pixelX = tileX * 8 + col
                        const pixelY = tileY * 8 + row
                        
                        if (pixelX < image.width && pixelY < image.height) {
                            const pixelIndex = (pixelY * image.width + pixelX) * 4
                            const r = data[pixelIndex]
                            const g = data[pixelIndex + 1]
                            const b = data[pixelIndex + 2]
                            
                            const colorValue = colorToGBDKValue(r, g, b)
                            const bit = 7 - col
                            
                            return {
                                lowBit: (colorValue & 1) ? (1 << bit) : 0,
                                highBit: (colorValue & 2) ? (1 << bit) : 0
                            }
                        }
                        return { lowBit: 0, highBit: 0 }
                    }).reduce(
                        (acc, { lowBit, highBit }) => ({
                            lowByte: acc.lowByte | lowBit,
                            highByte: acc.highByte | highBit
                        }),
                        { lowByte: 0, highByte: 0 }
                    )
                    
                    return [lowByte, highByte]
                })
            ).flat()
        ).flat(2)
        
        // Format tile data as hexadecimal strings (functional approach)
        const hexData = Array.from({ length: Math.ceil(tiles.length / 8) }, (_, i) => {
            const chunk = tiles.slice(i * 8, (i + 1) * 8)
            const hexValues = chunk.map(byte => 
                `0x${byte.toString(16).padStart(2, '0').toUpperCase()}`
            )
            return `    ${hexValues.join(', ')}`
        }).join('\n')
        
        // Build GBDK code using template literals (functional approach)
        const gbdkCode = [
            `// Automatically generated Sprite/Tile`,
            `// Dimensions: ${image.width}x${image.height} pixels (${tileWidth}x${tileHeight} tiles)`,
            `// Generated on: ${new Date().toISOString()}`,
            '',
            `#include <gb/gb.h>`,
            '',
            `// Sprite/tile data`,
            `const unsigned char ${baseName}_data[] = {`,
            hexData,
            '};',
            '',
            `// Sprite/tile information:`,
            `#define ${baseName.toUpperCase()}_WIDTH ${image.width}`,
            `#define ${baseName.toUpperCase()}_HEIGHT ${image.height}`,
            `#define ${baseName.toUpperCase()}_TILE_WIDTH ${tileWidth}`,
            `#define ${baseName.toUpperCase()}_TILE_HEIGHT ${tileHeight}`,
            `#define ${baseName.toUpperCase()}_TILE_COUNT ${tileWidth * tileHeight}`,
            `#define ${baseName.toUpperCase()}_SIZE ${tiles.length}`,
            '',
            `// Usage example:`,
            `// set_sprite_data(0, ${tileWidth * tileHeight}, ${baseName}_data);`,
            `// set_sprite_tile(0, 0); // To use the first tile`
        ].join('\n')
        
        // Save file
        fs.writeFileSync(outputPath, gbdkCode);
        
        if (verbose) {
            console.log(`🎮 GBDK code generated: ${outputPath}`);
            console.log(`📊 Tiles generated: ${tileWidth * tileHeight} (${tileWidth}x${tileHeight})`);
        }
        
        return {
            success: true,
            inputPath: imagePath,
            outputPath,
            tilesGenerated: tileWidth * tileHeight,
            tileWidth,
            tileHeight,
            dataSize: tiles.length,
            message: `GBDK code generated: ${outputPath}`
        };
        
    } catch (error) {
        const errorMessage = `Error generating GBDK code: ${error.message}`;
        if (verbose) {
            console.error(`❌ ${errorMessage}`);
        }
        
        return {
            success: false,
            error: errorMessage,
            inputPath: imagePath,
            outputPath
        };
    }
}

/**
 * Converts an image and optionally generates GBDK code
 * @param {string} inputPath - Input file path
 * @param {Object} options - Configuration options
 * @param {string} options.outputPath - Custom output path
 * @param {boolean} options.generateGBDK - Generate GBDK code
 * @param {boolean} options.verbose - Show detailed information
 * @param {string} options.variableName - Custom name for GBDK variables
 * @returns {Promise<Object>} Conversion result
 */
async function convertImage(inputPath, options = {}) {
    const {
        outputPath: customOutputPath,
        generateGBDK = false,
        verbose = true,
        variableName
    } = options;
    
    // Validations
    if (!fs.existsSync(inputPath)) {
        const error = `File does not exist: ${inputPath}`;
        if (verbose) console.error(`❌ ${error}`);
        return { success: false, error };
    }
    
    if (!inputPath.toLowerCase().endsWith('.png')) {
        const error = 'File must be a PNG image';
        if (verbose) console.error(`❌ ${error}`);
        return { success: false, error };
    }
    
    // Generate output path if not provided (functional approach)
    const outputPath = customOutputPath || (() => {
        const parsedPath = path.parse(inputPath);
        return path.join(parsedPath.dir, `${parsedPath.name}_gameboy${parsedPath.ext}`);
    })();
    
    const result = {
        conversion: null,
        gbdk: null
    };
    
    // Convert image
    if (verbose) {
        console.log(`🔄 Converting ${inputPath} to Game Boy palette...`);
    }
    result.conversion = await convertToGameBoy(inputPath, outputPath, { verbose });
    
    // Generate GBDK code if requested
    if (generateGBDK && result.conversion.success) {
        if (verbose) {
            console.log('🎮 Generating GBDK code...');
        }
        const parsedPath = path.parse(outputPath);
        const gbdkPath = path.join(parsedPath.dir, `${parsedPath.name}.c`);
        result.gbdk = await generateGBDKCode(outputPath, gbdkPath, { verbose, variableName });
    }
    
    return {
        success: result.conversion.success,
        ...result
    };
}

export {
    GAMEBOY_PALETTE,
    convertToGameBoy,
    generateGBDKCode,
    convertImage,
    findClosestGameBoyColor,
    colorToGBDKValue,
    colorDistance
};
