const fs = require('fs-extra');
const {join} = require("path");

async function copyAssets() {
    try {

        // Copy admin directory
        await fs.copy(join(__dirname, '/src/assets/admin'), join(__dirname, '/dist/assets/admin'));

        // Copy aero1Sources directory
        await fs.copy(join(__dirname, '/src/assets/aero1Sources'), join(__dirname, '/dist/assets/aero1Sources'));

        // Copy aero2Sources directory
        await fs.copy(join(__dirname, '/src/assets/aero2Sources'), join(__dirname, '/dist/assets/aero2Sources'));

        // Copy aero3Sources directory
        await fs.copy(join(__dirname, '/src/assets/aero3Sources'), join(__dirname, '/dist/assets/aero3Sources'));

        // Copy image directory
        await fs.copy(join(__dirname, '/src/assets/image'), join(__dirname, '/dist/assets/image'));

        // Copy json directory
        await fs.copy(join(__dirname, '/src/assets/json'), join(__dirname, '/dist/assets/json'));

        // Copy utils directory
        await fs.copy(join(__dirname, 'src/assets/utils'), join(__dirname, 'dist/assets/utils'));

        // Move deployPrivateFiles.sh to dist
        await fs.copy(join(__dirname, 'deployPrivateFiles.sh'), join(__dirname, 'dist/deployPrivateFiles.sh'));

        console.log('Assets copied successfully.');
    } catch (error) {
        console.error('Error copying assets:', error);
    }
}

copyAssets();
