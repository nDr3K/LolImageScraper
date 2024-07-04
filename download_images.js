const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const imagesFolderName = 'Images';

async function fetchAndSaveImages(url, folderName) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    const rankingLinks = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('a.ranking')).map(a => a.href);
    });

    for (const subUrl of rankingLinks) {
        await fetchImagesFromSubpage(subUrl, page, folderName);
    }

    await browser.close();
}

async function fetchImagesFromSubpage(url, page, folderName) {
    await page.goto(url, { waitUntil: 'networkidle2' });

    const infoDivs = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('div.info')).map(div => {
            const style = div.getAttribute('style');
            const imageUrlMatch = /url\(([^)]+)\)/.exec(style);
            const summonerName = div.querySelector('div.summoner-name').innerText.trim();
            return imageUrlMatch ? { imageUrl: imageUrlMatch[1].replace(/["']/g, ''), summonerName } : null;
        }).filter(info => info !== null);
    });

    for (const info of infoDivs) {
        await saveImage(info.imageUrl, info.summonerName, folderName);
    }
}

async function saveImage(imageUrl, imageName, folderName) {
    if (!isValidUrl(imageUrl)) {
        console.error(`Invalid URL: ${imageUrl}`);
        return;
    }

    const protocol = imageUrl.startsWith('https') ? require('https') : require('http');
    protocol.get(imageUrl, (response) => {
        const imagePath = path.join(__dirname, imagesFolderName, `${imageName}.png`);
        const fileStream = fs.createWriteStream(imagePath);
        response.pipe(fileStream);
        fileStream.on('finish', () => {
            fileStream.close(() => {
                convertToWebP(imagePath, imageName, folderName);
            });
        });
    }).on('error', (err) => {
        console.error(`Error downloading image ${imageUrl}: ${err.message}`);
    });
}

function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

function convertToWebP(imagePath, imageName, folderName) {
    const webpPath = path.join(__dirname, imagesFolderName,  folderName, `${imageName}.webp`);
    exec(`cwebp "${imagePath}" -o "${webpPath}"`, (error, _, __) => {
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

const url = process.argv[2];
const folderName = process.argv[3];

const imagesDir = path.join(__dirname, imagesFolderName, folderName);
if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
}

if (!url || !folderName) {
    console.error('Please provide a URL as the first argument and a folder name as the second argument.');
    process.exit(1);
}

fetchAndSaveImages(url, folderName);