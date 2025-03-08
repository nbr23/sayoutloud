(function () {
    browser.runtime.onMessage.addListener((message) => {
        if (message.action === "playAudio" && message.url) {
            const { playbackSpeed=1 } = message;
            injectAudioPlayer(message.url, playbackSpeed);
        }
    });

    function createOrGetButton(id, audioPlayer) {
        let playButton = document.getElementById(id);
        if (!playButton) {
            playButton = document.createElement('button');
            playButton.id = id;
            playButton.textContent = 'Play Audio';
            playButton.style.position = 'fixed';
            playButton.style.bottom = '60px';
            playButton.style.right = '20px';
            playButton.style.zIndex = '9999';
            playButton.style.padding = '10px';
            playButton.style.backgroundColor = '#4285f4';
            playButton.style.color = 'white';
            playButton.style.border = 'none';
            playButton.style.borderRadius = '4px';
            playButton.style.cursor = 'pointer';
            playButton.addEventListener('click', () => {
                audioPlayer.play();
                playButton.style.display = 'none';
            });
            document.body.appendChild(playButton);
        }
        return playButton;
    }

    function createOrGetAudioPlayer(id) {
        let audioPlayer = document.getElementById(id);
        if (!audioPlayer) {
            audioPlayer = document.createElement('audio');
            audioPlayer.id = id;
            audioPlayer.controls = true;
            audioPlayer.style.position = 'fixed';
            audioPlayer.style.bottom = '20px';
            audioPlayer.style.right = '20px';
            audioPlayer.style.zIndex = '9999';
            document.body.appendChild(audioPlayer);
        }
        return audioPlayer;
    }

    function injectAudioPlayer(url, playbackSpeed) {
        const audioPlayer = createOrGetAudioPlayer('sayoutloud-injected-audio-player');
        audioPlayer.src = url;
        audioPlayer.playbackRate = playbackSpeed;

        audioPlayer.play().catch(error => {
            if (error instanceof DOMException) {
                return;
            }
            console.log("Autoplay prevented due to browser policy:", JSON.stringify(error));
            createOrGetButton('sayoutloud-injected-play-button', audioPlayer);
        });
    }
})();