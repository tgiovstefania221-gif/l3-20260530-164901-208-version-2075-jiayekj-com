(function () {
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const setActiveNav = () => {
    const path = location.pathname.split('/').pop() || 'index.html';
    qsa('.main-nav a').forEach(a => {
      const href = a.getAttribute('href');
      if (href === path || (path === '' && href === 'index.html')) a.classList.add('active');
    });
  };

  const bindMenu = () => {
    const btn = qs('[data-menu-btn]');
    const nav = qs('[data-main-nav]');
    if (!btn || !nav) return;
    btn.addEventListener('click', () => nav.classList.toggle('is-open'));
  };

  const filterCards = (root) => {
    const input = qs('[data-filter-input]', root);
    const cards = qsa('[data-filter-card]', root);
    const typeButtons = qsa('[data-filter-type]', root);
    const sortSelect = qs('[data-sort-select]', root);
    const yearSelect = qs('[data-year-select]', root);
    const regionSelect = qs('[data-region-select]', root);

    if (!input && !cards.length) return;

    const state = {
      query: '',
      type: 'all',
      year: 'all',
      region: 'all',
      sort: 'default',
    };

    const apply = () => {
      const query = state.query.trim().toLowerCase();
      let visible = [];
      cards.forEach(card => {
        const title = (card.dataset.title || '').toLowerCase();
        const search = (card.dataset.search || '').toLowerCase();
        const type = card.dataset.type || '';
        const year = card.dataset.year || '';
        const region = card.dataset.region || '';
        const pass = (!query || title.includes(query) || search.includes(query))
          && (state.type === 'all' || type === state.type)
          && (state.year === 'all' || year === state.year)
          && (state.region === 'all' || region.includes(state.region));
        card.style.display = pass ? '' : 'none';
        if (pass) visible.push(card);
      });
      if (state.sort === 'year-desc') {
        visible.sort((a, b) => Number(b.dataset.year || 0) - Number(a.dataset.year || 0));
      } else if (state.sort === 'year-asc') {
        visible.sort((a, b) => Number(a.dataset.year || 0) - Number(b.dataset.year || 0));
      } else if (state.sort === 'title') {
        visible.sort((a, b) => (a.dataset.title || '').localeCompare(b.dataset.title || '', 'zh-Hans-CN'));
      }
      visible.forEach(el => el.parentElement && el.parentElement.appendChild(el));
      const counter = qs('[data-filter-count]');
      if (counter) counter.textContent = visible.length;
    };

    input && input.addEventListener('input', (e) => { state.query = e.target.value; apply(); });
    typeButtons.forEach(btn => btn.addEventListener('click', () => {
      typeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.type = btn.dataset.filterType || 'all';
      apply();
    }));
    sortSelect && sortSelect.addEventListener('change', (e) => { state.sort = e.target.value; apply(); });
    yearSelect && yearSelect.addEventListener('change', (e) => { state.year = e.target.value; apply(); });
    regionSelect && regionSelect.addEventListener('change', (e) => { state.region = e.target.value; apply(); });

    const params = new URLSearchParams(location.search);
    if (params.get('q')) { state.query = params.get('q'); input && (input.value = state.query); }
    if (params.get('type')) {
      state.type = params.get('type');
      typeButtons.forEach(b => b.classList.toggle('active', (b.dataset.filterType || '') === state.type));
    }
    if (params.get('year')) { state.year = params.get('year'); yearSelect && (yearSelect.value = state.year); }
    if (params.get('region')) { state.region = params.get('region'); regionSelect && (regionSelect.value = state.region); }
    apply();
  };

  const initHeroCarousel = () => {
    const slides = qsa('[data-slide]');
    if (slides.length <= 1) return;
    let idx = slides.findIndex(s => s.classList.contains('is-active'));
    if (idx < 0) idx = 0;
    const show = (next) => {
      slides.forEach(s => s.classList.remove('is-active'));
      slides[next].classList.add('is-active');
    };
    setInterval(() => {
      idx = (idx + 1) % slides.length;
      show(idx);
    }, 6000);
  };

  const initPlayer = () => {
    const video = qs('[data-hls-video]');
    if (!video) return;
    const m3u8 = video.dataset.hlsSrc;
    const mp4 = video.dataset.mp4Src;
    const status = qs('[data-player-status]');
    const btn = qs('[data-player-toggle]');
    const setStatus = (msg) => { if (status) status.textContent = msg; };

    const attach = (src, type) => {
      video.src = src;
      if (type) video.type = type;
      setStatus(type && type.includes('mpegurl') ? 'HLS 播放源已加载' : 'MP4 播放源已加载');
    };

    if (window.Hls && window.Hls.isSupported && window.Hls.isSupported()) {
      try {
        const hls = new window.Hls();
        hls.loadSource(m3u8);
        hls.attachMedia(video);
        setStatus('HLS 初始化中…');
        hls.on(window.Hls.Events.MANIFEST_PARSED, () => setStatus('HLS 播放源已准备就绪'));
        hls.on(window.Hls.Events.ERROR, () => attach(mp4, 'video/mp4'));
      } catch (err) {
        attach(mp4, 'video/mp4');
      }
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      attach(m3u8, 'application/vnd.apple.mpegurl');
    } else {
      attach(mp4, 'video/mp4');
    }

    if (btn) {
      btn.addEventListener('click', async () => {
        try {
          if (video.paused) {
            await video.play();
            btn.textContent = '暂停播放';
            setStatus('正在播放');
          } else {
            video.pause();
            btn.textContent = '开始播放';
            setStatus('已暂停');
          }
        } catch (err) {
          setStatus('浏览器暂时阻止了自动播放，请再次点击');
        }
      });
    }

    video.addEventListener('play', () => {
      if (btn) btn.textContent = '暂停播放';
      setStatus('正在播放');
    });
    video.addEventListener('pause', () => {
      if (btn) btn.textContent = '开始播放';
      setStatus('已暂停');
    });
    video.addEventListener('error', () => setStatus('播放器已回退到可用源'));
  };

  document.addEventListener('DOMContentLoaded', () => {
    setActiveNav();
    bindMenu();
    filterCards(document);
    initHeroCarousel();
    initPlayer();
    const year = qs('[data-current-year]');
    if (year) year.textContent = new Date().getFullYear();
  });
})();
