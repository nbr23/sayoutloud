(function () {
    browser.runtime.onMessage.addListener((message) => {
        if (message.action === "playAudio" && message.url) {
            const { playbackSpeed = 1 } = message;
            injectAudioPlayer(message.url, playbackSpeed);
        }
    });

    function createOrGetPlayButton(id, audioPlayer) {
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

    function createCloseButton(audioPlayerId, playButtonId) {
        const closeButton = document.createElement('button');
        closeButton.textContent = 'x';
        closeButton.style.position = 'fixed';
        closeButton.style.bottom = '45px';
        closeButton.style.right = '15px';
        closeButton.style.zIndex = '10000';
        closeButton.style.padding = '4px 8px';
        closeButton.style.backgroundColor = '#444444';
        closeButton.style.color = 'white';
        closeButton.style.border = 'none';
        closeButton.style.borderRadius = '50%';
        closeButton.style.cursor = 'pointer';
        closeButton.style.fontSize = '12px';
        closeButton.style.fontWeight = 'bold';
        closeButton.style.width = '20px';
        closeButton.style.height = '20px';
        closeButton.style.display = 'flex';
        closeButton.style.alignItems = 'center';
        closeButton.style.justifyContent = 'center';

        closeButton.addEventListener('click', () => {
            const audioPlayer = document.getElementById(audioPlayerId);
            const playButton = document.getElementById(playButtonId);
            if (audioPlayer) {
                audioPlayer.pause();
                audioPlayer.remove();
            }
            if (playButton) {
                playButton.remove();
            }
            closeButton.remove();
        });

        document.body.appendChild(closeButton);
        return closeButton;
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
        const AUDIO_PLAYER_ID = 'sayoutloud-injected-audio-player';
        const PLAY_BUTTON_ID = 'sayoutloud-injected-play-button';

        const audioPlayer = createOrGetAudioPlayer(AUDIO_PLAYER_ID);
        audioPlayer.src = url;
        audioPlayer.playbackRate = playbackSpeed;

        createCloseButton(AUDIO_PLAYER_ID, PLAY_BUTTON_ID);

        audioPlayer.play().catch(error => {
            if (error instanceof DOMException) {
                return;
            }
            console.log("Autoplay prevented due to browser policy:", JSON.stringify(error));
            createOrGetPlayButton(PLAY_BUTTON_ID, audioPlayer);
        });
    }
})();