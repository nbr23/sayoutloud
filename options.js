
document.addEventListener('DOMContentLoaded', async () => {
    const result = await browser.storage.local.get('apiEndpoint');
    if (result.apiEndpoint) {
        document.getElementById('apiEndpoint').value = result.apiEndpoint;
    }
});

document.getElementById('options-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const apiEndpoint = document.getElementById('apiEndpoint').value;

    try {
        new URL(apiEndpoint);
        await browser.storage.local.set({ apiEndpoint });
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