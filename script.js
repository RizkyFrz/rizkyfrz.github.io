(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* Tanda bahwa JS berjalan + mulai opening animation hero */
  const root = document.documentElement;
  root.dataset.ok = '1';
  const startHero = () => requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('ready')));

  /* Preloader singkat (sekali per sesi). Hero mulai sedikit sebelum overlay selesai memudar. */
  const pre = $('#preloader');
  if (pre && root.classList.contains('pre')) {
    try { sessionStorage.setItem('rfIntro', '1'); } catch (_) {}
    const lowMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const OUT = lowMotion ? 350 : 1250;
    let done = false;
    const timers = [];
    const finish = () => {
      if (done) return;
      done = true;
      timers.forEach(clearTimeout);
      pre.classList.add('out');
      startHero();
      setTimeout(() => root.classList.remove('pre'), 440);
    };
    if (!lowMotion) {
      $$('animate, animateMotion', pre).forEach(a => {
        if (typeof a.beginElementAt === 'function') a.beginElementAt(parseFloat(a.dataset.at || 0));
      });
    }
    timers.push(setTimeout(startHero, OUT - 200), setTimeout(finish, OUT));
    ['pointerdown', 'keydown'].forEach(ev => addEventListener(ev, finish, { once: true }));
  } else {
    startHero();
  }

  /* Indikator progres scroll (rAF, tanpa loop terus-menerus) */
  const bar = $('#progress');
  let ticking = false;
  const upd = () => {
    const max = root.scrollHeight - innerHeight;
    bar.style.setProperty('--p', max > 0 ? Math.min(scrollY / max, 1) : 0);
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(upd); } }, { passive: true });
  addEventListener('resize', upd);
  upd();

  /* Tahun footer */
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  /* Navigasi mobile */
  const toggle = $('#navToggle'), list = $('#navList');
  const setMenu = open => {
    list.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open);
    toggle.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
  };
  toggle.addEventListener('click', () => setMenu(!list.classList.contains('open')));
  $$('a', list).forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && list.classList.contains('open')) { setMenu(false); toggle.focus(); }
  });
  /* Orientasi / lebar berubah ke desktop: pastikan menu tertutup */
  addEventListener('resize', () => { if (innerWidth > 720 && list.classList.contains('open')) setMenu(false); });

  /* Penanda navigasi aktif + scroll reveal */
  const links = $$('.nav-list a');
  const sections = $$('main section[id]');
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        links.forEach(a => {
          const on = a.getAttribute('href') === '#' + en.target.id;
          a.classList.toggle('active', on);
          on ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(s => spy.observe(s));

    /* Sekali saja per elemen, dengan stagger antar-saudara */
    const rev = new IntersectionObserver((entries, o) => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); o.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    $$('.reveal').forEach(el => {
      const sib = [...el.parentElement.children].filter(c => c.classList.contains('reveal'));
      el.style.setProperty('--i', Math.min(sib.indexOf(el), 5));
      rev.observe(el);
    });
  } else {
    $$('.reveal').forEach(el => el.classList.add('in'));
  }

  /* Diagram jaringan: fokus perangkat + jeda animasi saat tidak perlu */
  const nets = $$('.net-svg'), cap = $('#netCap');
  if (nets.length && cap) {
    const INFO = {
      workstation: ['Workstation', 'Komputer desktop sebagai titik awal lalu lintas data di jaringan lokal.'],
      laptop: ['Laptop', 'Perangkat klien yang terhubung ke switch untuk mengakses jaringan.'],
      switch: ['Network Switch', 'Menghubungkan perangkat dalam satu jaringan lokal dan meneruskan data ke tujuan yang tepat.'],
      server: ['Server', 'Menyediakan layanan dan penyimpanan bagi perangkat di jaringan.'],
      router: ['Router', 'Menghubungkan jaringan lokal ke internet; sinyal di atasnya menandai akses wireless (Wi-Fi).'],
      internet: ['Internet Gateway', 'Pintu keluar menuju internet dan layanan cloud.']
    };
    const baseCap = cap.textContent;

    const select = name => {
      nets.forEach(svg => {
        if (name) svg.dataset.focus = name; else delete svg.dataset.focus;
        $$('.dev', svg).forEach(d => d.classList.toggle('is-on', d.dataset.dev === name));
        $$('[data-rel]', svg).forEach(p => p.classList.toggle('is-rel', !!name && p.dataset.rel.split(' ').includes(name)));
      });
      if (name && INFO[name]) {
        const b = document.createElement('strong');
        b.textContent = INFO[name][0];
        cap.replaceChildren(b, ' — ' + INFO[name][1]);
      } else {
        cap.textContent = baseCap;
      }
    };

    $$('.dev').forEach(dev => {
      const name = dev.dataset.dev;
      dev.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') select(name); });
      dev.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse' && document.activeElement !== dev) select(null); });
      dev.addEventListener('focus', () => select(name));
      dev.addEventListener('blur', () => select(null));
      dev.addEventListener('click', () => select(name));
    });
    document.addEventListener('pointerdown', e => { if (!e.target.closest('.dev')) select(null); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') select(null); });

    /* Animasi SMIL (paket data & nyala node) hanya berjalan saat diagram terlihat,
       tab aktif, dan pengguna tidak meminta pengurangan gerak. */
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const visible = new Set();
    const sync = () => nets.forEach(svg => {
      if (typeof svg.pauseAnimations !== 'function') return;
      (visible.has(svg) && !reduced.matches && !document.hidden) ? svg.unpauseAnimations() : svg.pauseAnimations();
    });
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(es => {
        es.forEach(e => e.isIntersecting ? visible.add(e.target) : visible.delete(e.target));
        sync();
      });
      nets.forEach(n => io.observe(n));
    } else {
      nets.forEach(n => visible.add(n));
    }
    reduced.addEventListener ? reduced.addEventListener('change', sync) : reduced.addListener(sync);
    document.addEventListener('visibilitychange', sync);
    sync();
  }

  /* Lightbox sertifikat (<dialog> menutup dengan Escape secara native) */
  const lb = $('#lightbox'), lbImg = $('#lbImg'), lbCap = $('#lbCaption'), lbPdf = $('#lbPdf');
  let opener = null;
  $$('.cert').forEach(btn => btn.addEventListener('click', () => {
    const img = $('img', btn);
    opener = btn;
    lbImg.src = img.currentSrc || img.src;
    lbImg.alt = img.alt;
    lbCap.textContent = btn.dataset.caption;
    lbPdf.href = btn.dataset.pdf;
    typeof lb.showModal === 'function' ? lb.showModal() : window.open(btn.dataset.pdf, '_blank', 'noopener');
  }));
  $('#lbClose').addEventListener('click', () => lb.close());
  lb.addEventListener('click', e => { if (e.target === lb) lb.close(); });
  lb.addEventListener('close', () => { lbImg.src = ''; if (opener) opener.focus(); });

  /* Formulir Web3Forms: status hanya ditampilkan setelah server menjawab */
  const form = $('#contactForm'), status = $('#formStatus'), btn = $('#submitBtn');
  const say = (msg, cls) => { status.textContent = msg; status.className = 'status ' + (cls || ''); };
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (btn.disabled) return;
    if (!form.checkValidity()) { form.reportValidity(); return; }
    btn.disabled = true;
    say('Mengirim pesan…');
    try {
      const res = await fetch(form.action, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form)
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data && data.success === true) {
        say('Pesan terkirim. Terima kasih, saya akan segera membalas.', 'ok');
        form.reset();
      } else {
        say((data && data.message) ? 'Pesan belum terkirim: ' + data.message : 'Pesan belum terkirim. Silakan coba lagi.', 'err');
      }
    } catch (_) {
      say('Tidak dapat terhubung ke server. Periksa koneksi Anda lalu coba lagi, atau hubungi lewat WhatsApp.', 'err');
    } finally {
      btn.disabled = false;
    }
  });
})();
