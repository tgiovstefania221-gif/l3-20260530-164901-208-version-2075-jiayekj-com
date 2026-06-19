(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-site-nav]');
    if (toggle && nav) {
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, n) {
                slide.classList.toggle('is-active', n === current);
            });
            dots.forEach(function (dot, n) {
                dot.classList.toggle('is-active', n === current);
            });
        }

        function go(step) {
            show(current + step);
        }

        function start() {
            timer = window.setInterval(function () {
                go(1);
            }, 5000);
        }

        function restart() {
            window.clearInterval(timer);
            start();
        }

        if (prev) {
            prev.addEventListener('click', function () {
                go(-1);
                restart();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                go(1);
                restart();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                restart();
            });
        });
        show(0);
        start();
    }

    document.querySelectorAll('[data-search-form]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            var input = form.querySelector('input[name="q"]');
            if (!input || !input.value.trim()) {
                event.preventDefault();
                window.location.href = './search.html';
            }
        });
    });

    var panel = document.querySelector('[data-filter-panel]');
    if (panel) {
        var textInput = panel.querySelector('[data-filter-text]');
        var regionSelect = panel.querySelector('[data-filter-region]');
        var yearSelect = panel.querySelector('[data-filter-year]');
        var typeSelect = panel.querySelector('[data-filter-type]');
        var categorySelect = panel.querySelector('[data-filter-category]');
        var empty = panel.querySelector('[data-filter-empty]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');

        if (query && textInput) {
            textInput.value = query;
        }

        function valueOf(input) {
            return input ? input.value.trim().toLowerCase() : '';
        }

        function applyFilters() {
            var text = valueOf(textInput);
            var region = valueOf(regionSelect);
            var year = valueOf(yearSelect);
            var type = valueOf(typeSelect);
            var category = valueOf(categorySelect);
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute('data-title') || '',
                    card.getAttribute('data-region') || '',
                    card.getAttribute('data-year') || '',
                    card.getAttribute('data-type') || '',
                    card.getAttribute('data-genre') || '',
                    card.textContent || ''
                ].join(' ').toLowerCase();
                var matched = true;
                if (text && haystack.indexOf(text) === -1) {
                    matched = false;
                }
                if (region && (card.getAttribute('data-region') || '').toLowerCase() !== region) {
                    matched = false;
                }
                if (year && (card.getAttribute('data-year') || '').toLowerCase() !== year) {
                    matched = false;
                }
                if (type && (card.getAttribute('data-type') || '').toLowerCase() !== type) {
                    matched = false;
                }
                if (category && (card.getAttribute('data-category') || '').toLowerCase() !== category) {
                    matched = false;
                }
                card.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.hidden = visible > 0;
            }
        }

        [textInput, regionSelect, yearSelect, typeSelect, categorySelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilters);
                control.addEventListener('change', applyFilters);
            }
        });
        applyFilters();
    }
})();
