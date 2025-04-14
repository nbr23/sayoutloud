const menuIdPrefix = "sayoutloud-";

async function getProfiles() {
    const result = await browser.storage.local.get('profiles');
    return result.profiles || [];
}

async function getProfile(name) {
    const profiles = await getProfiles();
    const profile = profiles.find(profile => profile.name === name);
    if (!profile && profiles.length > 0) {
        return profiles[0];
    }
    return profile;
}

async function getApiEndpoint() {
    const result = await browser.storage.local.get('apiEndpoint');
    if (!result.apiEndpoint) {
        throw new Error('API endpoint not configured. Please configure it in the extension settings.');
    }
    return result.apiEndpoint;
}

async function getApiAuthToken() {
    const result = await browser.storage.local.get('apiAuthToken');
    return result.apiAuthToken;
}

async function getPlaybackSpeed() {
    const result = await browser.storage.local.get('playbackSpeed');
    return result.playbackSpeed || 1;
}

browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId.startsWith(menuIdPrefix) && info.selectionText) {
        sendToAPI(info.menuItemId.replace(menuIdPrefix, ""), tab, info.selectionText);
    }
});

browser.commands.onCommand.addListener(async (command) => {
    if (command.startsWith(menuIdPrefix)) {
        const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
        const [{ result }] = await browser.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => window.getSelection().toString()
        });
        if (result) {
            sendToAPI(command.replace(menuIdPrefix, ""), tab, result);
        }
    }
});

let audioContext;

async function initAudioContext() {
    if (!audioContext) {
        audioContext = new AudioContext();
    }
    return audioContext;
}

async function playAudio(tab, url, playbackSpeed) {
    try {
        await browser.scripting.executeScript({
            target: { tabId: tab.id },
            files: ["content.js"]
        });
        const message = {
            action: "playAudio",
            url,
            playbackSpeed,
        };
        browser.tabs.sendMessage(tab.id, message);
    } catch (error) {
        console.error('Error playing audio:', error);
        throw error;
    }
}

async function sendToAPI(profile, tab, text) {
    const profileData = await getProfile(profile);
    if (!profileData) {
        console.error(`Profile not found: ${profile}`);
        return;
    }
    try {
        const headers = {
            'Content-Type': 'application/json',
        };
        const { apiEndpoint, apiAuthToken, playbackSpeed } = profileData;
        const url = new URL(apiEndpoint);
        if (apiAuthToken) {
            headers['Authorization'] = apiAuthToken;
        }
        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                text: text
            })
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const { streamId } = await response.json();
        await playAudio(tab, `${url.origin + url.pathname}/${streamId}`, playbackSpeed);

    } catch (error) {
        console.error('Error processing request:', error);
    }
}