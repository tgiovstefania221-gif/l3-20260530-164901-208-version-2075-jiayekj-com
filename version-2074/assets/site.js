(function () {
    var toggle = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (toggle && panel) {
        toggle.addEventListener("click", function () {
            var open = panel.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    document.querySelectorAll(".js-hero").forEach(function (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var prev = hero.querySelector(".hero-control.prev");
        var next = hero.querySelector(".hero-control.next");
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                start();
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                start();
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    });

    document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
        var input = panel.querySelector("[data-filter-input]");
        var year = panel.querySelector("[data-year-filter]");
        var reset = panel.querySelector("[data-filter-reset]");
        var grid = panel.nextElementSibling ? panel.nextElementSibling.querySelector(".movie-grid") : null;
        var empty = panel.nextElementSibling ? panel.nextElementSibling.querySelector("[data-filter-empty]") : null;
        var cards = grid ? Array.prototype.slice.call(grid.querySelectorAll("[data-filter-card]")) : [];

        function apply() {
            var q = input ? input.value.trim().toLowerCase() : "";
            var y = year ? year.value : "";
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-tags")
                ].join(" ").toLowerCase();
                var okText = !q || haystack.indexOf(q) !== -1;
                var okYear = !y || card.getAttribute("data-year") === y;
                var ok = okText && okYear;
                card.style.display = ok ? "" : "none";
                if (ok) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }

        if (input) {
            input.addEventListener("input", apply);
        }
        if (year) {
            year.addEventListener("change", apply);
        }
        if (reset) {
            reset.addEventListener("click", function () {
                if (input) {
                    input.value = "";
                }
                if (year) {
                    year.value = "";
                }
                apply();
            });
        }
        apply();
    });
})();

function initMoviePlayer(videoId, streamUrl) {
    var video = document.getElementById(videoId);
    if (!video || !streamUrl) {
        return;
    }
    var box = video.closest(".player");
    var overlay = box ? box.querySelector(".player-overlay") : null;
    var ready = false;
    var hlsInstance = null;

    function attach() {
        if (ready) {
            return;
        }
        ready = true;
        if (video.canPlayType("application/vnd.apple.mpegurl") || video.canPlayType("application/x-mpegURL")) {
            video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({ enableWorker: true });
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
        } else {
            video.src = streamUrl;
        }
    }

    function play() {
        attach();
        video.controls = true;
        if (box) {
            box.classList.add("is-playing");
        }
        var request = video.play();
        if (request && typeof request.catch === "function") {
            request.catch(function () {});
        }
    }

    if (overlay) {
        overlay.addEventListener("click", play);
    }
    video.addEventListener("click", function () {
        if (video.paused) {
            play();
        }
    });
    window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}

function renderSearchPage() {
    var input = document.getElementById("search-input");
    var results = document.getElementById("search-results");
    var empty = document.getElementById("search-empty");
    if (!input || !results || !empty || !window.SEARCH_DATA) {
        return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    input.value = initial;

    function card(item) {
        var tags = (item.tags || []).slice(0, 3).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return "<a class=\"movie-card\" href=\"" + escapeHtml(item.link) + "\">" +
            "<span class=\"poster-wrap\">" +
            "<img src=\"" + escapeHtml(item.cover) + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">" +
            "<span class=\"play-badge\">▶</span>" +
            "<span class=\"corner-label\">" + escapeHtml(item.category) + "</span>" +
            "</span>" +
            "<span class=\"movie-body\">" +
            "<strong>" + escapeHtml(item.title) + "</strong>" +
            "<em>" + escapeHtml(item.oneLine) + "</em>" +
            "<span class=\"movie-meta\"><span>" + escapeHtml(item.region) + "</span><span>" + escapeHtml(item.year) + "</span><span>" + escapeHtml(item.type) + "</span></span>" +
            "<span class=\"tag-row\">" + tags + "</span>" +
            "</span>" +
            "</a>";
    }

    function run() {
        var q = input.value.trim().toLowerCase();
        if (!q) {
            results.innerHTML = "";
            empty.textContent = "输入关键词开始搜索";
            empty.classList.add("is-visible");
            return;
        }
        var found = window.SEARCH_DATA.filter(function (item) {
            var text = [item.title, item.region, item.year, item.type, item.genre, item.category, item.oneLine, (item.tags || []).join(" ")].join(" ").toLowerCase();
            return text.indexOf(q) !== -1;
        }).slice(0, 120);
        results.innerHTML = found.map(card).join("");
        empty.textContent = "暂无匹配内容";
        empty.classList.toggle("is-visible", found.length === 0);
    }

    input.addEventListener("input", run);
    run();
}

function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, function (char) {
        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "\"": "&quot;",
            "'": "&#39;"
        }[char];
    });
}
