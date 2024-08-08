const fs = require('fs');
const path = require('path');
const { saveImage, imagesFolderName } = require('./utils');

async function fetchChampionData() {
    try {
        const versionResponse = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
        const versions = await versionResponse.json();
        const version = versions[0];
        const championsResponse = await fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`);
        const championsData = await championsResponse.json();
        return { version, champions: championsData.data };
    } catch (error) {
        console.error('Error fetching champion data:', error.message);
        return null;
    }
}

async function fetchAndSaveImages(folderName) {
    const data = await fetchChampionData();
    if (!data) return;

    const { version, champions } = data;
    const size = 60;

    for (const key in champions) {
        const champion = champions[key];
        const imageUrl = `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${key}.png`;
        await saveImage(imageUrl, champion.id.replace(" ", "_"), folderName, size);
    }
}

const folderName = "Champions";

const imagesDir = path.join(__dirname, imagesFolderName, folderName);
if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
}

fetchAndSaveImages(folderName);