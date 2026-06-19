(function () {
    function setupPlayer(shell) {
        var video = shell.querySelector('video');
        var cover = shell.querySelector('.player-cover');
        if (!video) {
            return;
        }
        var stream = video.getAttribute('data-stream');
        var started = false;
        var hls = null;

        function playVideo() {
            var result = video.play();
            if (result && typeof result.catch === 'function') {
                result.catch(function () {});
            }
        }

        function start() {
            if (started || !stream) {
                return;
            }
            started = true;
            if (cover) {
                cover.hidden = true;
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
                video.addEventListener('loadedmetadata', playVideo, { once: true });
                video.load();
                playVideo();
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
                hls.on(window.Hls.Events.ERROR, function (_, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    }
                });
                return;
            }
            video.src = stream;
            video.load();
            playVideo();
        }

        if (cover) {
            cover.addEventListener('click', start);
        }
        video.addEventListener('click', function () {
            if (!started) {
                start();
            }
        });
        video.addEventListener('play', function () {
            if (!started) {
                start();
            }
        });
        window.addEventListener('pagehide', function () {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    }

    document.querySelectorAll('[data-player]').forEach(setupPlayer);
})();
