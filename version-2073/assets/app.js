(function () {
  var mobileButton = document.querySelector('[data-mobile-button]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');
  if (mobileButton && mobilePanel) {
    mobileButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var menuButton = document.querySelector('[data-menu-button]');
  if (menuButton) {
    menuButton.addEventListener('click', function () {
      var parent = menuButton.closest('.nav-more');
      if (parent) {
        parent.classList.toggle('is-open');
      }
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var prev = document.querySelector('[data-hero-prev]');
  var next = document.querySelector('[data-hero-next]');
  var current = 0;
  var timer;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === current);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === current);
    });
  }

  function startTimer() {
    if (slides.length < 2) {
      return;
    }
    window.clearInterval(timer);
    timer = window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  if (prev) {
    prev.addEventListener('click', function () {
      showSlide(current - 1);
      startTimer();
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      showSlide(current + 1);
      startTimer();
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
      startTimer();
    });
  });

  showSlide(0);
  startTimer();

  var searchInput = document.querySelector('[data-search-input]');
  var results = document.querySelector('[data-search-results]');
  var summary = document.querySelector('[data-search-summary]');
  var params = new URLSearchParams(window.location.search);
  var initialKeyword = params.get('q') || '';

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function renderSearch(keyword) {
    if (!results || !window.SEARCH_MOVIES) {
      return;
    }
    var q = String(keyword || '').trim().toLowerCase();
    if (!q) {
      results.innerHTML = '';
      if (summary) {
        summary.textContent = '输入关键词后显示匹配影片。';
      }
      return;
    }
    var matched = window.SEARCH_MOVIES.filter(function (movie) {
      return movie.text.toLowerCase().indexOf(q) !== -1;
    }).slice(0, 120);
    if (summary) {
      summary.textContent = matched.length ? '已显示匹配度较高的影片。' : '未找到匹配影片，可更换关键词。';
    }
    results.innerHTML = matched.map(function (movie) {
      return '<article class="movie-card">' +
        '<a href="' + movie.url + '">' +
        '<span class="poster" style="background-image: linear-gradient(180deg, rgba(2, 6, 23, 0.08), rgba(2, 6, 23, 0.86)), url(\'' + movie.cover + '\');">' +
        '<span class="poster-badge">' + escapeHtml(movie.year) + '</span>' +
        '</span>' +
        '<span class="card-body">' +
        '<strong>' + escapeHtml(movie.title) + '</strong>' +
        '<em>' + escapeHtml(movie.genre) + '</em>' +
        '<span class="card-desc">' + escapeHtml(movie.desc) + '</span>' +
        '<span class="card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></span>' +
        '</span>' +
        '</a>' +
        '</article>';
    }).join('');
  }

  if (searchInput) {
    searchInput.value = initialKeyword;
    searchInput.addEventListener('input', function () {
      renderSearch(searchInput.value);
    });
    renderSearch(initialKeyword);
  }
})();
