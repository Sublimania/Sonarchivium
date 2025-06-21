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

function isAudioFile(fileName) {
    return audioExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
}

function cleanName(name) {
    return name.trim().replace(/[\u200B-\u200D\uFEFF]/g, '');
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
        }
    });
    li.appendChild(span);

    const subList = document.createElement('ul');
    subList.classList.add('hidden');
    subList.style.backgroundColor = `rgba(0, 0, 0, ${Math.min(level * 0.15, 0.5)})`;
    const borderAlpha = Math.min(level * 0.1, 0.3);
    subList.style.border = `1px solid rgba(255, 255, 255, ${borderAlpha})`;
    subList.style.padding = '10px';
    subList.style.borderRadius = '4px';
    subList.style.marginLeft = '10px';

    li.appendChild(subList);
    return li;
}

function createAudioFileItem(itemID, file) {
    const li = document.createElement('li');
    li.classList.add('audio-file');
    const link = document.createElement('a');
    link.textContent = file.name;
    link.href = `https://archive.org/details/${itemID}`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.style.marginRight = '10px';
    link.style.cursor = 'pointer';
    li.appendChild(link);

    const audioPlayer = document.createElement('audio');
    audioPlayer.src = `https://archive.org/download/${itemID}/${encodeURIComponent(file.name)}`;
    audioPlayer.controls = true;
    audioPlayer.preload = 'auto';
    audioPlayer.style.marginLeft = '10px';
    li.appendChild(audioPlayer);

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
