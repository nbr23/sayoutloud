
document.addEventListener('DOMContentLoaded', async () => {
    const apiEndpoint = await browser.storage.local.get('apiEndpoint');
    const apiAuthToken = await browser.storage.local.get('apiAuthToken');
    const playbackSpeed = await browser.storage.local.get('playbackSpeed');

    if (apiEndpoint.apiEndpoint) {
        document.getElementById('apiEndpoint').value = apiEndpoint.apiEndpoint;
    }
    if (apiAuthToken.apiAuthToken) {
        document.getElementById('apiAuthToken').value = apiAuthToken.apiAuthToken;
    }
    if (playbackSpeed.playbackSpeed) {
        document.getElementById('playbackSpeed').value = playbackSpeed.playbackSpeed || 1;
    }
});

document.getElementById('options-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const apiEndpoint = document.getElementById('apiEndpoint').value;
    const apiAuthToken = document.getElementById('apiAuthToken').value;
    const playbackSpeed = parseFloat(document.getElementById('playbackSpeed').value) || 1;

    try {
        new URL(apiEndpoint);
        await browser.storage.local.set({
            apiEndpoint,
            apiAuthToken,
            playbackSpeed
        });
        const status = document.getElementById('status');
        status.textContent = 'Settings saved!';
        status.className = 'success';
        setTimeout(() => {
            status.textContent = '';
        }, 3000);
    } catch (err) {
        const status = document.getElementById('status');
        status.textContent = 'Please enter a valid URL';
        status.className = 'error';
    }
});