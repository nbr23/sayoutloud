const menuIdPrefix = "sayoutloud-";

document.addEventListener('DOMContentLoaded', async () => {
    loadProfiles();

    document.getElementById('add-profile').addEventListener('click', () => {
        addProfile();
    });

    document.getElementById('profiles-container').addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-profile')) {
            removeProfile(e.target.closest('.profile'));
        }
    });

    document.getElementById('options-form').addEventListener('submit', saveAllProfiles);
});

async function loadProfiles() {
    const storage = await browser.storage.local.get('profiles');
    const profiles = storage.profiles || [];
    
    const container = document.getElementById('profiles-container');
    container.innerHTML = '';
    
    if (profiles.length === 0) {
        addProfile({
            name: '',
            apiEndpoint: '',
            apiAuthToken: '',
            playbackSpeed: '1.0'
        });
    } else {
        profiles.forEach(profile => {
            addProfile(profile);
        });
    }
}

function addProfile(data = {}) {
    const template = document.getElementById('profile-template');
    const clone = document.importNode(template.content, true);
    const container = document.getElementById('profiles-container');
    
    if (data) {
        clone.querySelector('.profile-name').value = data.name || '';
        clone.querySelector('.api-endpoint').value = data.apiEndpoint || '';
        clone.querySelector('.api-auth-token').value = data.apiAuthToken || '';
        clone.querySelector('.playback-speed').value = data.playbackSpeed || '1.0';
    }
    
    container.appendChild(clone);
}

function removeProfile(profileElement) {
    const container = document.getElementById('profiles-container');
    if (container.children.length > 1) {
        profileElement.remove();
    } else {
        showStatus('At least one profile is required', 'error');
    }
}

async function saveAllProfiles(e) {
    e.preventDefault();
    
    try {
        const profiles = [];
        const profileElements = document.querySelectorAll('.profile');
        
        for (const element of profileElements) {
            const name = element.querySelector('.profile-name').value;
            const apiEndpoint = element.querySelector('.api-endpoint').value;
            const apiAuthToken = element.querySelector('.api-auth-token').value;
            const playbackSpeed = element.querySelector('.playback-speed').value || '1.0';
            
            // Validate URL
            try {
                new URL(apiEndpoint);
            } catch (err) {
                showStatus(`Invalid URL in profile "${name}"`, 'error');
                return;
            }
            
            profiles.push({
                name,
                apiEndpoint,
                apiAuthToken,
                playbackSpeed: parseFloat(playbackSpeed) || 1.0
            });
        }

        const names = profiles.map(p => p.name);
        if (new Set(names).size !== names.length) {
            showStatus('Profile names must be unique', 'error');
            return;
        }

        await browser.storage.local.set({ profiles });
        await createContextMenuOptions(profiles);

        showStatus('All settings saved successfully!', 'success');
    } catch (err) {
        showStatus(`Error saving settings: ${err.message}`, 'error');
    }
}

async function createContextMenuOptions(profiles) {
    await browser.contextMenus.removeAll();
    for (const profile of profiles) {
        browser.contextMenus.create({
            id: `${menuIdPrefix}${profile.name}`,
            title: `SayOutLoud (${profile.name})`,
            contexts: ["selection"]
        });
    }
}


function showStatus(message, type) {
    const status = document.getElementById('status');
    status.textContent = message;
    status.className = type;
    setTimeout(() => {
        status.textContent = '';
        status.className = '';
    }, 3000);
}