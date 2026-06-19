(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function setupHeader() {
    var toggle = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === active);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    function restart() {
      window.clearInterval(timer);
      start();
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });

    start();
  }

  function setupFilters() {
    var lists = Array.prototype.slice.call(document.querySelectorAll("[data-filter-list]"));
    lists.forEach(function (list) {
      var scope = list.closest("section") || document;
      var textInput = scope.querySelector("[data-filter-text]");
      var regionSelect = scope.querySelector("[data-filter-region]");
      var yearSelect = scope.querySelector("[data-filter-year]");
      var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));

      function apply() {
        var textValue = normalize(textInput && textInput.value);
        var regionValue = normalize(regionSelect && regionSelect.value);
        var yearValue = normalize(yearSelect && yearSelect.value);
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-year"),
            card.getAttribute("data-tags")
          ].join(" "));
          var cardRegion = normalize(card.getAttribute("data-region"));
          var cardYear = normalize(card.getAttribute("data-year"));
          var matched = true;
          if (textValue && haystack.indexOf(textValue) === -1) {
            matched = false;
          }
          if (regionValue && cardRegion !== regionValue) {
            matched = false;
          }
          if (yearValue && cardYear !== yearValue) {
            matched = false;
          }
          card.style.display = matched ? "" : "none";
        });
      }

      [textInput, regionSelect, yearSelect].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
    });
  }

  function cardTemplate(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<a href="./search.html?q=' + encodeURIComponent(tag) + '">' + escapeHtml(tag) + '</a>';
    }).join("");
    return [
      '<article class="movie-card">',
      '<a class="poster-link" href="' + escapeHtml(movie.url) + '" aria-label="' + escapeHtml(movie.title) + '">',
      '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<span class="poster-shade"></span>',
      '<span class="poster-year">' + escapeHtml(movie.year) + '</span>',
      '<span class="poster-play">▶</span>',
      '</a>',
      '<div class="movie-card-body">',
      '<div class="movie-meta-line">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.genre) + '</div>',
      '<h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
      '<p>' + escapeHtml(movie.oneLine) + '</p>',
      '<div class="tag-row">' + tags + '</div>',
      '</div>',
      '</article>'
    ].join("");
  }

  function setupSearchPage() {
    var results = document.querySelector("[data-search-results]");
    if (!results || !window.SEARCH_MOVIES) {
      return;
    }
    var summary = document.querySelector("[data-search-summary]");
    var params = new URLSearchParams(window.location.search);
    var query = normalize(params.get("q"));
    var input = document.querySelector('.search-page-form input[name="q"]');
    if (input) {
      input.value = params.get("q") || "";
    }
    var list = window.SEARCH_MOVIES.filter(function (movie) {
      if (!query) {
        return true;
      }
      var haystack = normalize([
        movie.title,
        movie.region,
        movie.year,
        movie.genre,
        (movie.tags || []).join(" "),
        movie.oneLine
      ].join(" "));
      return haystack.indexOf(query) !== -1;
    }).slice(0, 240);

    results.innerHTML = list.map(cardTemplate).join("");
    if (summary) {
      summary.classList.add("is-visible");
      summary.textContent = query ? "搜索结果已为你整理如下" : "可直接浏览推荐内容，也可以输入关键词继续搜索";
    }
  }

  ready(function () {
    setupHeader();
    setupHero();
    setupFilters();
    setupSearchPage();
  });
})();
