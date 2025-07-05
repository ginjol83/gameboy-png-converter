import { createCanvas, loadImage } from 'canvas'
import fs from 'fs'
import path from 'path'

// Game Boy color palette (4 shades of green)
const GAMEBOY_PALETTE = [
    { r: 155, g: 188, b: 15 },   // Lightest green
    { r: 139, g: 172, b: 15 },   // Light green
    { r: 48, g: 98, b: 48 },     // Dark green
    { r: 15, g: 56, b: 15 }      // Darkest green
];

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
 * Finds the closest color in the Game Boy palette (functional approach)
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
 * Converts a PNG image to Game Boy palette (functional approach)
 * @param {string} inputPath - Input file path
 * @param {string} outputPath - Output file path
 * @returns {Promise<void>}
 */
const convertToGameBoy = async (inputPath, outputPath) => {
    try {
        // Load the image
        const image = await loadImage(inputPath)
        
        console.log(`📏 Processing ${image.width}x${image.height} pixel image`)
        
        // Create canvas to process the image (use original size)
        const canvas = createCanvas(image.width, image.height)
        const ctx = canvas.getContext('2d')
        
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
        const newImageData = ctx.createImageData(image.width, image.height)
        newImageData.data.set(convertedData)
        
        // Apply the new pixel data
        ctx.putImageData(newImageData, 0, 0)
        
        // Save the converted image
        const buffer = canvas.toBuffer('image/png')
        fs.writeFileSync(outputPath, buffer)
        
        console.log(`✅ Image successfully converted: ${outputPath}`)
        
    } catch (error) {
        console.error(`❌ Error converting image: ${error.message}`)
    }
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
 * Generates C code for GBDK from a converted image (functional approach)
 * @param {string} imagePath - Path of the converted image
 * @param {string} outputPath - Path of the C code file
 * @returns {Promise<void>}
 */
const generateGBDKCode = async (imagePath, outputPath) => {
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
        const baseName = path.parse(imagePath).name.replace(/[^a-zA-Z0-9]/g, '_')

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
            `#define ${baseName.toUpperCase()}_SIZE ${tiles.length}`,
            '',
            `// Usage example:`,
            `// set_sprite_data(0, ${tileWidth * tileHeight}, ${baseName}_data);`,
            `// set_sprite_tile(0, 0); // To use the first tile`
        ].join('\n')
        
        // Save file
        fs.writeFileSync(outputPath, gbdkCode)
        console.log(`🎮 GBDK code generated: ${outputPath}`)
        console.log(`📊 Tiles generated: ${tileWidth * tileHeight} (${tileWidth}x${tileHeight})`)
        
    } catch (error) {
        console.error(`❌ Error generating GBDK code: ${error.message}`)
    }
}

/**
 * Main function (functional approach)
 * @returns {Promise<void>}
 */
const main = async () => {
    const args = process.argv.slice(2)
    
    if (args.length === 0) {
        console.log('🎮 PNG to Game Boy palette converter')
        console.log('')
        console.log('Usage:')
        console.log('  node index.js <input_file.png> [output_file.png] [--gbdk]')
        console.log('')
        console.log('Options:')
        console.log('  --gbdk    Also generates C code for GBDK')
        console.log('')
        console.log('Examples:')
        console.log('  node index.js image.png')
        console.log('  node index.js image.png gameboy_image.png')
        console.log('  node index.js image.png --gbdk')
        console.log('  node index.js image.png gameboy_image.png --gbdk')
        console.log('')
        console.log('Note: Accepts PNG images of any size')
        return
    }
    
    // Check if GBDK code generation is requested
    const generateGBDK = args.includes('--gbdk')
    const filteredArgs = args.filter(arg => arg !== '--gbdk')
    
    const inputPath = filteredArgs[0]
    
    // Generate output path if not provided (functional approach)
    const outputPath = filteredArgs[1] || (() => {
        const parsedPath = path.parse(inputPath)
        return path.join(parsedPath.dir, `${parsedPath.name}_gameboy${parsedPath.ext}`)
    })()
    
    // Verify that the input file exists
    if (!fs.existsSync(inputPath)) {
        console.error(`❌ File does not exist: ${inputPath}`)
        return
    }
    
    // Verify that it's a PNG file
    if (!inputPath.toLowerCase().endsWith('.png')) {
        console.error('❌ File must be a PNG image')
        return
    }
    
    console.log(`🔄 Converting ${inputPath} to Game Boy palette...`)
    await convertToGameBoy(inputPath, outputPath)
    
    // Generate GBDK code if requested
    if (generateGBDK) {
        console.log('🎮 Generating GBDK code...')
        const parsedPath = path.parse(outputPath)
        const gbdkPath = path.join(parsedPath.dir, `${parsedPath.name}.c`)
        await generateGBDKCode(outputPath, gbdkPath)
    }
}

// Run the application
main().catch(console.error)
