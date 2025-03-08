browser.contextMenus.create({
    id: "speak-selected-text",
    title: "SayOutLoud",
    contexts: ["selection"]
});

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
    if (info.menuItemId === "speak-selected-text" && info.selectionText) {
        sendToAPI(tab, info.selectionText);
    }
});

browser.commands.onCommand.addListener(async (command) => {
    if (command === "speak-selected-text") {
        const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
        const [{ result }] = await browser.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => window.getSelection().toString()
        });
        if (result) {
            sendToAPI(result);
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

async function playAudio(tab, url) {
    try {
        await browser.scripting.executeScript({
            target: { tabId: tab.id },
            files: ["content.js"]
        });
        const message = {
            action: "playAudio",
            url,
            playbackSpeed: await getPlaybackSpeed()
        };
        browser.tabs.sendMessage(tab.id, message);
    } catch (error) {
        console.error('Error playing audio:', error);
        throw error;
    }
}

async function sendToAPI(tab, text) {
    try {
        const headers = {
            'Content-Type': 'application/json',
        };
        const url = new URL(await getApiEndpoint());
        const apiAuthToken = await getApiAuthToken();
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
        await playAudio(tab, `${url.origin + url.pathname}/${streamId}`);

    } catch (error) {
        console.error('Error processing request:', error);
    }
}