(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    var menuButton = document.getElementById("menuToggle");
    var mobileMenu = document.getElementById("mobileMenu");

    if (menuButton && mobileMenu) {
        menuButton.addEventListener("click", function () {
            mobileMenu.classList.toggle("open");
        });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
        var slides = selectAll("[data-hero-slide]", hero);
        var dots = selectAll("[data-hero-dot]", hero);
        var nextButton = hero.querySelector("[data-hero-next]");
        var prevButton = hero.querySelector("[data-hero-prev]");
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        }

        function move(step) {
            show(current + step);
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                move(1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        if (nextButton) {
            nextButton.addEventListener("click", function () {
                move(1);
                start();
            });
        }

        if (prevButton) {
            prevButton.addEventListener("click", function () {
                move(-1);
                start();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });

        start();
    }

    var cards = selectAll(".filterable-grid .video-card");
    var localSearch = document.getElementById("localSearch");
    var regionFilter = document.getElementById("regionFilter");
    var yearFilter = document.getElementById("yearFilter");
    var typeFilter = document.getElementById("typeFilter");
    var emptyState = document.getElementById("emptyState");

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function fillSearchFromUrl() {
        if (!localSearch) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q");
        if (query) {
            localSearch.value = query;
        }
    }

    function filterCards() {
        if (!cards.length) {
            return;
        }

        var query = normalize(localSearch ? localSearch.value : "");
        var region = regionFilter ? regionFilter.value : "";
        var year = yearFilter ? yearFilter.value : "";
        var type = typeFilter ? typeFilter.value : "";
        var visibleCount = 0;

        cards.forEach(function (card) {
            var text = normalize([
                card.getAttribute("data-title"),
                card.getAttribute("data-region"),
                card.getAttribute("data-year"),
                card.getAttribute("data-genre"),
                card.getAttribute("data-type"),
                card.getAttribute("data-tags")
            ].join(" "));
            var matchQuery = !query || text.indexOf(query) !== -1;
            var matchRegion = !region || card.getAttribute("data-region") === region;
            var matchYear = !year || card.getAttribute("data-year") === year;
            var matchType = !type || card.getAttribute("data-type") === type;
            var visible = matchQuery && matchRegion && matchYear && matchType;

            card.style.display = visible ? "" : "none";
            if (visible) {
                visibleCount += 1;
            }
        });

        if (emptyState) {
            emptyState.classList.toggle("show", visibleCount === 0);
        }
    }

    fillSearchFromUrl();

    [localSearch, regionFilter, yearFilter, typeFilter].forEach(function (item) {
        if (item) {
            item.addEventListener("input", filterCards);
            item.addEventListener("change", filterCards);
        }
    });

    filterCards();
})();
