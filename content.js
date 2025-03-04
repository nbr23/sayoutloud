(function() {
    browser.runtime.onMessage.addListener((message) => {
      if (message.action === "playAudio" && message.url) {
        injectAudioPlayer(message.url);
      }
    });
    
    function injectAudioPlayer(url) {
      const audioPlayer = document.createElement('audio');
      audioPlayer.id = 'injected-audio-player';
      audioPlayer.controls = true;
      audioPlayer.style.position = 'fixed';
      audioPlayer.style.bottom = '20px';
      audioPlayer.style.right = '20px';
      audioPlayer.style.zIndex = '9999';
      
      audioPlayer.src = url;
      
      document.body.appendChild(audioPlayer);
      
      audioPlayer.play().catch(error => {
        console.log("Autoplay prevented due to browser policy:", error);
        const playButton = document.createElement('button');
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
      });
    }
  })();