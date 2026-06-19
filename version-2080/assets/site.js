(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    function initMenu() {
        var button = document.querySelector('[data-menu-button]');
        var menu = document.querySelector('[data-mobile-menu]');
        if (!button || !menu) {
            return;
        }
        button.addEventListener('click', function () {
            menu.classList.toggle('is-open');
            button.textContent = menu.classList.contains('is-open') ? '×' : '☰';
        });
    }

    function initHero() {
        var root = document.querySelector('[data-hero-slider]');
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }
        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                stop();
                show(i);
                start();
            });
        });
        root.addEventListener('mouseenter', stop);
        root.addEventListener('mouseleave', start);
        start();
    }

    function initFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
        panels.forEach(function (panel) {
            var section = panel.parentElement;
            var grid = section ? section.querySelector('[data-filter-grid]') : null;
            if (!grid) {
                return;
            }
            var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-card]'));
            var input = panel.querySelector('[data-search-input]');
            var selects = Array.prototype.slice.call(panel.querySelectorAll('[data-filter]'));
            var empty = document.createElement('div');
            empty.className = 'empty-state';
            empty.textContent = '没有匹配的内容';
            function valueOf(name) {
                var el = panel.querySelector('[data-filter="' + name + '"]');
                return el ? el.value.trim().toLowerCase() : '';
            }
            function apply() {
                var query = input ? input.value.trim().toLowerCase() : '';
                var region = valueOf('region');
                var type = valueOf('type');
                var year = valueOf('year');
                var category = valueOf('category');
                var visible = 0;
                cards.forEach(function (card) {
                    var search = (card.getAttribute('data-search') || '').toLowerCase();
                    var ok = true;
                    if (query && search.indexOf(query) === -1) {
                        ok = false;
                    }
                    if (region && (card.getAttribute('data-region') || '').toLowerCase().indexOf(region) === -1) {
                        ok = false;
                    }
                    if (type && (card.getAttribute('data-type') || '').toLowerCase().indexOf(type) === -1) {
                        ok = false;
                    }
                    if (year && (card.getAttribute('data-year') || '').toLowerCase() !== year) {
                        ok = false;
                    }
                    if (category && (card.getAttribute('data-category') || '').toLowerCase() !== category) {
                        ok = false;
                    }
                    card.classList.toggle('is-hidden', !ok);
                    if (ok) {
                        visible += 1;
                    }
                });
                if (!visible) {
                    if (!empty.parentElement) {
                        grid.appendChild(empty);
                    }
                } else if (empty.parentElement) {
                    empty.parentElement.removeChild(empty);
                }
            }
            if (input) {
                input.addEventListener('input', apply);
            }
            selects.forEach(function (select) {
                select.addEventListener('change', apply);
            });
        });
    }

    function initImages() {
        Array.prototype.slice.call(document.images).forEach(function (img) {
            img.addEventListener('error', function () {
                img.classList.add('image-missing');
            });
        });
    }

    function initPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
        players.forEach(function (shell) {
            var video = shell.querySelector('video');
            var button = shell.querySelector('[data-play-button]');
            var hls = null;
            var loaded = false;
            if (!video || !button) {
                return;
            }
            function load() {
                if (loaded) {
                    return;
                }
                var src = video.getAttribute('data-src');
                if (!src) {
                    return;
                }
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = src;
                    loaded = true;
                    shell.classList.add('is-ready');
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(src);
                    hls.attachMedia(video);
                    loaded = true;
                    shell.classList.add('is-ready');
                    return;
                }
                video.src = src;
                loaded = true;
                shell.classList.add('is-ready');
            }
            function play() {
                load();
                var result = video.play();
                shell.classList.add('is-playing');
                button.classList.add('is-hidden');
                if (result && typeof result.catch === 'function') {
                    result.catch(function () {
                        shell.classList.remove('is-playing');
                        button.classList.remove('is-hidden');
                    });
                }
            }
            button.addEventListener('click', function (event) {
                event.preventDefault();
                play();
            });
            video.addEventListener('play', function () {
                shell.classList.add('is-playing');
                button.classList.add('is-hidden');
            });
            video.addEventListener('ended', function () {
                shell.classList.remove('is-playing');
                button.classList.remove('is-hidden');
            });
            video.addEventListener('error', function () {
                shell.classList.remove('is-playing');
                button.classList.remove('is-hidden');
            });
            window.addEventListener('beforeunload', function () {
                if (hls && typeof hls.destroy === 'function') {
                    hls.destroy();
                }
            });
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initFilters();
        initImages();
        initPlayers();
    });
}());
