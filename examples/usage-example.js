const { convertImage, convertToGameBoy, generateGBDKCode } = require('../lib/gameboy-converter');
const path = require('path');

async function exampleUsage() {
    console.log('🎮 Usage example of gameboy-png-converter as a library\n');
    
    // Example 1: Simple conversion
    console.log('📝 Example 1: Simple conversion');
    const result1 = await convertImage('test_image.png', {
        verbose: true
    });
    
    if (result1.success) {
        console.log('✅ Successful conversion:', result1.conversion.outputPath);
    } else {
        console.log('❌ Error:', result1.conversion?.error || 'Unknown error');
    }
    
    console.log('\n' + '─'.repeat(50) + '\n');
    
    // Example 2: Conversion with GBDK code
    console.log('📝 Example 2: Conversion with GBDK code');
    const result2 = await convertImage('test_image.png', {
        outputPath: 'sprite_player.png',
        generateGBDK: true,
        variableName: 'player_sprite',
        verbose: true
    });
    
    if (result2.success) {
        console.log('✅ Successful conversion:', result2.conversion.outputPath);
        if (result2.gbdk?.success) {
            console.log('✅ GBDK code generated:', result2.gbdk.outputPath);
            console.log(`📊 Tiles: ${result2.gbdk.tilesGenerated}`);
        }
    }
    
    console.log('\n' + '─'.repeat(50) + '\n');
    
    // Example 3: Using individual functions
    console.log('📝 Example 3: Using individual functions');
    
    try {
        // Conversion only
        const conversionResult = await convertToGameBoy(
            'test_image.png', 
            'manual_convert.png',
            { verbose: false }
        );
        
        if (conversionResult.success) {
            console.log('✅ Manual conversion successful');
            
            // GBDK generation only
            const gbdkResult = await generateGBDKCode(
                'manual_convert.png',
                'manual_convert.c',
                { 
                    verbose: false, 
                    variableName: 'manual_sprite' 
                }
            );
            
            if (gbdkResult.success) {
                console.log('✅ Manual GBDK code generated');
                console.log(`📊 Data size: ${gbdkResult.dataSize} bytes`);
            }
        }
    } catch (error) {
        console.error('❌ Error in manual conversion:', error.message);
    }
    
    console.log('\n' + '─'.repeat(50) + '\n');
    
    // Example 4: Silent mode
    console.log('📝 Example 4: Silent mode');
    const result4 = await convertImage('test_image.png', {
        outputPath: 'silent_output.png',
        generateGBDK: true,
        verbose: false  // No console output
    });
    
    console.log('Silent conversion completed:', {
        success: result4.success,
        hasConversion: !!result4.conversion,
        hasGBDK: !!result4.gbdk
    });
}

// Execute example if called directly
if (require.main === module) {
    exampleUsage().catch(console.error);
}

module.exports = { exampleUsage };
