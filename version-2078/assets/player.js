function initStaticPlayer(videoUrl) {
  var video = document.getElementById('moviePlayer');
  var overlay = document.getElementById('playOverlay');
  var poster = document.getElementById('playerPoster');

  if (!video || !overlay || !videoUrl) {
    return;
  }

  var hasLoaded = false;

  function bindSource() {
    if (hasLoaded) {
      return;
    }

    hasLoaded = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(videoUrl);
      hls.attachMedia(video);
    } else {
      video.src = videoUrl;
    }
  }

  function startPlayback() {
    bindSource();
    overlay.classList.add('is-hidden');

    if (poster) {
      poster.classList.add('is-hidden');
    }

    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        overlay.classList.remove('is-hidden');
      });
    }
  }

  overlay.addEventListener('click', startPlayback);

  if (poster) {
    poster.addEventListener('click', startPlayback);
  }

  video.addEventListener('play', function () {
    overlay.classList.add('is-hidden');

    if (poster) {
      poster.classList.add('is-hidden');
    }
  });
}
