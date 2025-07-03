import { convertImage, convertToGameBoy, generateGBDKCode } from '../lib/gameboy-converter.js'
import path from 'path'

const exampleUsage = async () => {
    console.log('🎮 Usage example of gameboy-png-converter as a library\n')
    
    // Example 1: Simple conversion
    console.log('📝 Example 1: Simple conversion')
    const resultSimple = await convertImage('test_image.png', { verbose: true })
    
    (resultSimple.success)
        ? console.log('✅ Successful conversion:', resultSimple.conversion.outputPath)
        : console.log('❌ Error:', resultSimple.conversion?.error || 'Unknown error')
    
    console.log('\n' + '─'.repeat(50) + '\n')
    
    // Example 2: Conversion with GBDK code
    console.log('📝 Example 2: Conversion with GBDK code')
    
    const resultGBDKCode = await convertImage('test_image.png', {
        outputPath: 'sprite_player.png',
        generateGBDK: true,
        variableName: 'player_sprite',
        verbose: true
    })
    
    const gbdksuccess = resultGBDKCode.success
    
    if (gbdksuccess) {
        console.log('✅ Successful conversion:', resultGBDKCode.conversion.outputPath)
    }

    if (resultGBDKCode.gbdk?.success && gbdksuccess) {
        console.log('✅ GBDK code generated:', resultGBDKCode.gbdk.outputPath)
        console.log(`📊 Tiles: ${resultGBDKCode.gbdk.tilesGenerated}`)
    }
    
    console.log('\n' + '─'.repeat(50) + '\n')
    
    // Example 3: Using individual functions
    console.log('📝 Example 3: Using individual functions')
    
    try {
        // Conversion only
        const conversionResult = await convertToGameBoy(
            'test_image.png', 
            'manual_convert.png',
            { verbose: false }
        )
        
        const conversionSuccess = conversionResult.success

        conversionSuccess && console.log('✅ Manual conversion successful')


        // GBDK generation only
        const gbdkResult = conversionSuccess && await generateGBDKCode(
            'manual_convert.png',
            'manual_convert.c',
            { verbose: false, variableName: 'manual_sprite' }
        )
            
        if (conversionSuccess && gbdkResult.success) {
            console.log('✅ Manual GBDK code generated')
            console.log(`📊 Data size: ${gbdkResult.dataSize} bytes`)
        }
        
    } catch (error) {
        console.error('❌ Error in manual conversion:', error.message)
    }
    
    console.log('\n' + '─'.repeat(50) + '\n')
    
    // Example 4: Silent mode
    console.log('📝 Example 4: Silent mode')
    const resultSilent = await convertImage('test_image.png', {
        outputPath: 'silent_output.png',
        generateGBDK: true,
        verbose: false  // No console output
    })
    
    console.log('Silent conversion completed:', {
        success: resultSilent.success,
        hasConversion: !!resultSilent.conversion,
        hasGBDK: !!resultSilent.gbdk
    })
}

// Execute example if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    exampleUsage().catch(console.error)
}

export { exampleUsage }