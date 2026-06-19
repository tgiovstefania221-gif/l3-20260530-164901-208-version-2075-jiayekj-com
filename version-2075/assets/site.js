(function () {
  const toggle = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      const isOpen = mobileNav.hasAttribute('hidden') === false;
      if (isOpen) {
        mobileNav.setAttribute('hidden', '');
        toggle.setAttribute('aria-expanded', 'false');
      } else {
        mobileNav.removeAttribute('hidden');
        toggle.setAttribute('aria-expanded', 'true');
      }
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    const slides = Array.from(hero.querySelectorAll('.hero-slide'));
    const dots = Array.from(hero.querySelectorAll('.hero-dot'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let index = 0;
    let timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        const active = slideIndex === index;
        slide.classList.toggle('active', active);
        slide.setAttribute('aria-hidden', active ? 'false' : 'true');
      });
      dots.forEach(function (dot, dotIndex) {
        const active = dotIndex === index;
        dot.classList.toggle('active', active);
        dot.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
    }

    function start() {
      stop();
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

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-slide')) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  });

  document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
    const input = panel.querySelector('[data-filter-input]');
    const category = panel.querySelector('[data-filter-category]');
    const type = panel.querySelector('[data-filter-type]');
    const year = panel.querySelector('[data-filter-year]');
    const list = document.querySelector('[data-filter-list]');
    const empty = document.querySelector('[data-empty-state]');

    if (!list) {
      return;
    }

    const cards = Array.from(list.querySelectorAll('.movie-card'));
    const params = new URLSearchParams(window.location.search);
    const initial = params.get('q') || '';

    if (input && initial) {
      input.value = initial;
    }

    function match(card) {
      const query = input ? input.value.trim().toLowerCase() : '';
      const selectedCategory = category ? category.value : '';
      const selectedType = type ? type.value : '';
      const selectedYear = year ? year.value : '';
      const search = (card.getAttribute('data-search') || '').toLowerCase();
      const cardCategory = card.getAttribute('data-category') || '';
      const cardType = card.getAttribute('data-type') || '';
      const cardYear = card.getAttribute('data-year') || '';

      if (query && search.indexOf(query) === -1) {
        return false;
      }
      if (selectedCategory && cardCategory !== selectedCategory) {
        return false;
      }
      if (selectedType && cardType.indexOf(selectedType) === -1) {
        return false;
      }
      if (selectedYear && cardYear.indexOf(selectedYear) === -1) {
        return false;
      }
      return true;
    }

    function apply() {
      let visible = 0;
      cards.forEach(function (card) {
        const ok = match(card);
        card.hidden = !ok;
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    [input, category, type, year].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    apply();
  });
})();

function initMoviePlayer(videoId, streamUrl) {
  const video = document.getElementById(videoId);
  if (!video || !streamUrl) {
    return;
  }

  const shell = video.closest('.video-shell');
  const overlay = shell ? shell.querySelector('.play-overlay') : null;
  let attached = false;
  let hls = null;

  function attach() {
    if (attached) {
      return;
    }
    attached = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      return;
    }

    video.src = streamUrl;
  }

  function begin() {
    attach();
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
    const playAttempt = video.play();
    if (playAttempt && typeof playAttempt.catch === 'function') {
      playAttempt.catch(function () {});
    }
  }

  if (overlay) {
    overlay.addEventListener('click', begin);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      begin();
    }
  });

  video.addEventListener('play', function () {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
}
