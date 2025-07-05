import { convertImage } from '../lib/gameboy-converter.js'
import path from 'path'

/**
 * Main CLI function
 */

const main = async () => {
    const args = process.argv.slice(2)
    
    if (args.length === 0) {
        console.log('🎮 PNG to Game Boy palette converter')
        console.log('')
        console.log('Usage:')
        console.log('  npx gameboy-png-converter <input_file.png> [output_file.png] [--gbdk]')
        console.log('  gameboy-convert <input_file.png> [output_file.png] [--gbdk]')
        console.log('')
        console.log('Options:')
        console.log('  --gbdk              Also generates C code for GBDK')
        console.log('  --var <name>        Custom name for GBDK variables')
        console.log('  --quiet             Silent mode (no verbose output)')
        console.log('')
        console.log('Examples:')
        console.log('  gameboy-convert image.png')
        console.log('  gameboy-convert image.png gameboy_image.png')
        console.log('  gameboy-convert image.png --gbdk')
        console.log('  gameboy-convert sprite.png --gbdk --var player_sprite')
        console.log('  gameboy-convert image.png output.png --gbdk --quiet')
        console.log('')
        console.log('Note: Accepts PNG images of any size')
        return
    }
    
    // Process arguments
    const generateGBDK = args.includes('--gbdk')
    const quiet = args.includes('--quiet')
    
    const varIndex = args.indexOf('--var')
    const variableName = (varIndex !== -1 && varIndex + 1 < args.length) 
        ? args[varIndex + 1] 
        : null

    
    const filteredArgs = args.filter( arg => !['--gbdk', '--quiet', '--var'].includes(arg) && arg !== variableName )
    
    const inputPath = filteredArgs[0]
    const outputPath = filteredArgs[1]
    
    if (!inputPath) {
        console.error('❌ You must specify an input file')
        return
    }
    
    // Execute conversion
    const result = await convertImage(inputPath, {
        outputPath,
        generateGBDK,
        verbose: !quiet,
        variableName
    })
    
    if (!result.success) {
        process.exit(1)
    }
}

// Execute the CLI
main().catch(console.error)

export { main }
