const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const imagesFolderName = 'Images';

function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

function convertToWebP(imagePath, imageName, folderName, size) {
    const webpPath = path.join(__dirname, imagesFolderName,  folderName, `${imageName}.webp`);
    var command;
    if (size) {
        command = `cwebp -resize ${size} ${size} "${imagePath}" -o "${webpPath}"`
    } else {
        command = `cwebp "${imagePath}" -o "${webpPath}"`
    }
    exec(command, (error, _, __) => {
        if (error) {
            console.error(`Error converting image to webp: ${error.message}`);
            return;
        }
        fs.unlink(imagePath, (err) => {
            if (err) console.error(`Error deleting temporary png image: ${err.message}`);
        });
        console.log(`Saved image ${imageName}.webp`);
    });
}

async function saveImage(imageUrl, imageName, folderName, size = 0, imageExtension = 'png') {
    if (!isValidUrl(imageUrl)) {
        console.error(`Invalid URL: ${imageUrl}`);
        return;
    }

    const protocol = imageUrl.startsWith('https') ? require('https') : require('http');
    protocol.get(imageUrl, (response) => {
        const imagePath = path.join(__dirname, imagesFolderName, `${imageName}.${imageExtension}`);
        const fileStream = fs.createWriteStream(imagePath);
        response.pipe(fileStream);
        fileStream.on('finish', () => {
            fileStream.close(() => {
                convertToWebP(imagePath, imageName, folderName, size);
            });
        });
    }).on('error', (err) => {
        console.error(`Error downloading image ${imageUrl}: ${err.message}`);
    });
}

module.exports = {
    saveImage,
    imagesFolderName
};