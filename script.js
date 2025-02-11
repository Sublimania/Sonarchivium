const repoOwner = 'sonomaniac'; 
const repoName = 'audio-archive'; 
const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents`;

async function fetchRepoContents(path = '') {
    const response = await fetch(`${apiUrl}${path ? '/' + path : ''}`);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return await response.json();
}

function createTreeView(data) {
    const musicList = document.getElementById('music-list');
    const ul = document.createElement('ul');
    musicList.appendChild(ul);
    
    data.forEach(item => {
        if (item.type === 'dir') {
        
            const li = document.createElement('li');
            li.textContent = item.name;
            li.classList.add('folder');
            li.onclick = function (e) {
                e.stopPropagation();
                const subList = li.querySelector('ul');
                if (subList) {
                    subList.classList.toggle('hidden');
                } else {
                    fetchRepoContents(item.path).then(subData => {
                        const newUl = createTreeView(subData);
                        li.appendChild(newUl);
                    });
                }
            };
            ul.appendChild(li);
        } else if (item.type === 'file' && isAudioFile(item.name)) {
            
            const li = document.createElement('li');
            li.textContent = item.name;
            li.classList.add('audio-file');

            
            const audioPlayer = document.createElement('audio');
            audioPlayer.src = item.download_url;
            audioPlayer.controls = true;
            audioPlayer.style.marginLeft = '10px';

            li.appendChild(audioPlayer);
            ul.appendChild(li);
        }
    });
    return ul;
}

function isAudioFile(fileName) {
    const audioExtensions = ['.mp3', '.wav', '.ogg', '.flac', '.m4a'];
    return audioExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
}

async function init() {
    try {
        const data = await fetchRepoContents();
        createTreeView(data);
    } catch (error) {
        console.error('Error fetching repository contents:', error);
    }
}

document.addEventListener('DOMContentLoaded', init);
