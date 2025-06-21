const itemIDs = [
    // Veido
    'shame-on-you-final',
    'my-heart-belongs-to-you',
    // Lucif Cros
    'solar-system-zone',
    'the-twisting-trails',
    // Jody Parsley
    'this-is-me_202506',
    'soul-streak-bw-hooked'
];

const audioExtensions = ['.mp3', '.wav', '.ogg', '.flac', '.m4a'];

const audioCache = new Map();

function isAudioFile(fileName) {
    return audioExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
}

function cleanName(name) {
    return name.trim().replace(/[\u200B-\u200D\uFEFF]/g, '');
}

function preloadAudio(url) {
    if (!audioCache.has(url)) {
        const a = new Audio(url);
        a.preload = 'auto';
        a.load();
        audioCache.set(url, a);
    }
}

function createFolder(name, level = 1) {
    const li = document.createElement('li');
    li.classList.add('folder');
    const span = document.createElement('span');
    span.textContent = cleanName(name);
    span.style.cursor = 'pointer';
    span.addEventListener('click', e => {
        e.stopPropagation();
        const subList = li.querySelector('ul');
        if (subList) {
            subList.classList.toggle('hidden');
            li.classList.toggle('open');
        }
    });
    li.appendChild(span);

    const subList = document.createElement('ul');
    subList.classList.add('hidden');
    subList.style.backgroundColor = `rgba(0, 0, 0, ${Math.min(level * 0.15, 0.5)})`;
    const borderAlpha = Math.min(level * 0.1, 0.3);
    subList.style.border = `1px solid rgba(255, 255, 255, ${borderAlpha})`;
    subList.style.padding = '0px 25px';
    subList.style.width = 'fit-content';
    subList.style.borderRadius = '4px';
    subList.style.marginLeft = '25px';
    subList.style.boxSizing = 'border-box';

    li.appendChild(subList);
    return li;
}

function createAudioFileItem(itemID, file) {
    const li = document.createElement('li');
    li.classList.add('audio-file');

    const fileNameSpan = document.createElement('span');
    fileNameSpan.textContent = file.name;
    fileNameSpan.style.marginRight = '10px';
    fileNameSpan.style.cursor = 'pointer';
    fileNameSpan.style.color = 'var(--color-accent-red)';
    li.appendChild(fileNameSpan);

    const iaLink = document.createElement('a');
    iaLink.href = `https://archive.org/details/${itemID}`;
    iaLink.target = '_blank';
    iaLink.rel = 'noopener noreferrer';
    iaLink.textContent = '[IA Page]';
    iaLink.style.marginLeft = '10px';
    iaLink.style.color = 'var(--color-primary)';
    li.appendChild(iaLink);

    li.addEventListener('click', () => {
        const url = `https://archive.org/download/${itemID}/${encodeURIComponent(file.name)}`;
        preloadAudio(url);
        window.addToAudioQueue(file.name, url);
    });

    return li;
}

function insertFolderAlphabetically(container, folder) {
    const name = folder.querySelector('span').textContent.toLowerCase();
    const children = Array.from(container.children);
    for (let i = 0; i < children.length; i++) {
        const childName = children[i].querySelector('span').textContent.toLowerCase();
        if (name < childName) {
            container.insertBefore(folder, children[i]);
            return;
        }
    }
    container.appendChild(folder);
}

async function fetchAndDisplayItem(itemID, container, level = 1) {
    try {
        const metadataURL = `https://archive.org/metadata/${itemID}`;
        const response = await fetch(metadataURL);
        const data = await response.json();
        const artist = cleanName(data.metadata.creator || 'Unknown Artist');
        const track = cleanName(data.metadata.title || 'Unknown Track');
        const audioFiles = data.files.filter(f => isAudioFile(f.name));

        let artistFolder = Array.from(container.children).find(li => li.querySelector('span').textContent === artist);
        if (!artistFolder) {
            artistFolder = createFolder(artist, level);
            insertFolderAlphabetically(container, artistFolder);
        }

        const trackFolder = createFolder(track, level + 1);
        const trackUl = trackFolder.querySelector('ul');

        audioFiles.forEach(file => {
            trackUl.appendChild(createAudioFileItem(itemID, file));
        });

        insertFolderAlphabetically(artistFolder.querySelector('ul'), trackFolder);

        console.log(`Loaded ${itemID} → Artist: "${artist}", Track: "${track}"`);
    } catch (error) {
        console.error(`Error loading metadata for item: ${itemID}`, error);
    }
}

async function init() {
    const audioList = document.getElementById('audio-list');
    const loading = document.getElementById('loading');

    audioList.style.visibility = 'hidden';
    loading.style.display = 'block';
    audioList.innerHTML = '';

    for (const itemID of itemIDs) {
        await fetchAndDisplayItem(itemID, audioList, 1);
    }

    loading.style.display = 'none';
    audioList.style.visibility = 'visible';
}

document.addEventListener('DOMContentLoaded', init);
