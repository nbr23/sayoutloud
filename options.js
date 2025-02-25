
document.addEventListener('DOMContentLoaded', async () => {
    const apiEndpoint = await browser.storage.local.get('apiEndpoint');
    const apiAuthToken = await browser.storage.local.get('apiAuthToken');

    if (apiEndpoint.apiEndpoint) {
        document.getElementById('apiEndpoint').value = apiEndpoint.apiEndpoint;
    }
    if (apiAuthToken.apiAuthToken) {
        document.getElementById('apiAuthToken').value = apiAuthToken.apiAuthToken;
    }
});

document.getElementById('options-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const apiEndpoint = document.getElementById('apiEndpoint').value;
    const apiAuthToken = document.getElementById('apiAuthToken').value;

    try {
        new URL(apiEndpoint);
        await browser.storage.local.set({
            apiEndpoint,
            apiAuthToken
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