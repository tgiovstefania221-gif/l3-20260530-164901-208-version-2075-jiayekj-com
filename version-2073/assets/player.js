(function () {
  var video = document.querySelector('[data-player]');
  var playButton = document.querySelector('[data-play]');
  if (!video) {
    return;
  }

  var stream = video.getAttribute('data-stream');
  var shell = video.closest('.video-shell');
  var hlsInstance;

  function markPlaying() {
    if (shell) {
      shell.classList.add('is-playing');
    }
  }

  function showError() {
    if (playButton) {
      playButton.innerHTML = '<span>!</span><strong>播放失败</strong><em>请稍后再试</em>';
      playButton.disabled = false;
    }
  }

  function start() {
    if (!stream) {
      showError();
      return;
    }
    if (playButton) {
      playButton.disabled = true;
    }
    if (window.Hls && window.Hls.isSupported()) {
      if (!hlsInstance) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 60
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          markPlaying();
          video.play().catch(function () {
            if (playButton) {
              playButton.disabled = false;
            }
          });
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            showError();
          }
        });
      } else {
        markPlaying();
        video.play().catch(function () {});
      }
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      markPlaying();
      video.play().catch(function () {
        if (playButton) {
          playButton.disabled = false;
        }
      });
    } else {
      showError();
    }
  }

  if (playButton) {
    playButton.addEventListener('click', start);
  }
  video.addEventListener('click', function () {
    if (video.paused) {
      start();
    }
  });
})();
