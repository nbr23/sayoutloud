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

browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "speak-selected-text" && info.selectionText) {
        sendToAPI(info.selectionText);
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

async function playAudioBuffer(arrayBuffer) {
    try {
        const context = await initAudioContext();
        const audioBuffer = await context.decodeAudioData(arrayBuffer);
        const source = context.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(context.destination);
        source.start(0);
    } catch (error) {
        console.error('Error playing audio:', error);
        throw error;
    }
}

async function sendToAPI(text) {
    try {
        const response = await fetch(await getApiEndpoint(), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: text
            })
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        await playAudioBuffer(arrayBuffer);

    } catch (error) {
        console.error('Error processing request:', error);
    }
}