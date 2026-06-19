function initMoviePlayer(playerUrl) {
    var video = document.querySelector("[data-player-video]");
    var trigger = document.querySelector("[data-player-trigger]");
    var attached = false;
    var hlsInstance = null;

    if (!video || !playerUrl) {
        return;
    }

    function attach() {
        if (attached) {
            return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = playerUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(playerUrl);
            hlsInstance.attachMedia(video);
        } else {
            video.src = playerUrl;
        }

        attached = true;
    }

    function play() {
        attach();

        if (trigger) {
            trigger.classList.add("is-hidden");
        }

        video.setAttribute("controls", "controls");
        var promise = video.play();

        if (promise && typeof promise.catch === "function") {
            promise.catch(function () {
                if (trigger) {
                    trigger.classList.remove("is-hidden");
                }
            });
        }
    }

    if (trigger) {
        trigger.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
        if (!attached) {
            play();
        }
    });

    window.addEventListener("pagehide", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }
    });
}
