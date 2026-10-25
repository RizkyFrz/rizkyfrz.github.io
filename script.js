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
    toggle.setAttribute('aria-label', t(open ? 'menu.close' : 'menu.open'));
  };
  toggle.addEventListener('click', () => setMenu(!list.classList.contains('open')));
  $$('a', list).forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && list.classList.contains('open')) { setMenu(false); toggle.focus(); }
  });
  /* Orientasi / lebar berubah ke desktop: pastikan menu tertutup */
  addEventListener('resize', () => { if (innerWidth > 1024 && list.classList.contains('open')) setMenu(false); });

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
  let refreshCap = () => {};
  const nets = $$('.net-svg'), cap = $('#netCap');
  if (nets.length && cap) {
    const NAMES = { workstation: 'Workstation', laptop: 'Laptop', switch: 'Network Switch', server: 'Server', router: 'Router', internet: 'Internet Gateway' };
    let current = null;
    const showCap = () => {
      if (current && NAMES[current]) {
        const b = document.createElement('strong');
        b.textContent = NAMES[current];
        cap.replaceChildren(b, ' — ' + t('info.' + current));
      } else {
        cap.textContent = t('net.cap');
      }
    };
    refreshCap = showCap;

    const select = name => {
      nets.forEach(svg => {
        if (name) svg.dataset.focus = name; else delete svg.dataset.focus;
        $$('.dev', svg).forEach(d => d.classList.toggle('is-on', d.dataset.dev === name));
        $$('[data-rel]', svg).forEach(p => p.classList.toggle('is-rel', !!name && p.dataset.rel.split(' ').includes(name)));
      });
      current = name || null;
      showCap();
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
  let state = null;
  const renderStatus = () => {
    if (!state) { status.textContent = ''; status.className = 'status'; return; }
    status.textContent = t(state.key) + (state.extra && lang === 'en' ? ' ' + state.extra : '');
    status.className = 'status ' + (state.cls || '');
  };
  const say = (key, cls, extra) => { state = key ? { key, cls, extra } : null; renderStatus(); };

  /* Pesan validasi mengikuti bahasa halaman */
  $$('input[type=text], input[type=email], textarea', form).forEach(f => {
    f.addEventListener('invalid', () => {
      f.setCustomValidity('');
      const v = f.validity;
      f.setCustomValidity(v.valueMissing ? t('val.required') : v.typeMismatch ? t('val.email') : '');
    });
    f.addEventListener('input', () => f.setCustomValidity(''));
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (btn.disabled) return;
    if (!form.checkValidity()) { form.reportValidity(); return; }
    btn.disabled = true;
    say('status.sending');
    try {
      const res = await fetch(form.action, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form)
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data && data.success === true) {
        say('status.ok', 'ok');
        form.reset();
      } else {
        say('status.fail', 'err', data && data.message);
      }
    } catch (_) {
      say('status.net', 'err');
    } finally {
      btn.disabled = false;
    }
  });

  /* ===== Tema & bahasa (pilihan disimpan di localStorage; default: gelap + Indonesia) ===== */
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (_) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (_) {} }
  };
  const STR = {
    id: {
      'menu.open': 'Buka menu', 'menu.close': 'Tutup menu',
      'theme.toLight': 'Ganti ke mode terang', 'theme.toDark': 'Ganti ke mode gelap',
      'net.cap': 'Alur data dari perangkat lokal ke internet. Arahkan kursor, atau ketuk sebuah perangkat, untuk melihat perannya.',
      'info.workstation': 'Komputer desktop sebagai titik awal lalu lintas data di jaringan lokal.',
      'info.laptop': 'Perangkat klien yang terhubung ke switch untuk mengakses jaringan.',
      'info.switch': 'Menghubungkan perangkat dalam satu jaringan lokal dan meneruskan data ke tujuan yang tepat.',
      'info.server': 'Menyediakan layanan dan penyimpanan bagi perangkat di jaringan.',
      'info.router': 'Menghubungkan jaringan lokal ke internet; sinyal di atasnya menandai akses wireless (Wi-Fi).',
      'info.internet': 'Pintu keluar menuju internet dan layanan cloud.',
      'status.sending': 'Mengirim pesan…',
      'status.ok': 'Pesan terkirim. Terima kasih, saya akan segera membalas.',
      'status.fail': 'Pesan belum terkirim. Silakan coba lagi.',
      'status.net': 'Tidak dapat terhubung ke server. Periksa koneksi Anda lalu coba lagi, atau hubungi lewat WhatsApp.',
      'val.required': 'Harap isi kolom ini.', 'val.email': 'Masukkan alamat email yang valid.'
    },
    en: {
      'skip': 'Skip to content', 'nav.aria': 'Main navigation', 'lang.group': 'Language',
      'nav.exp': 'Experience', 'idx.exp': 'Experience', 'idx.cv': 'Download',
      'exp.title': 'Work Experience', 'exp.main': 'Main experience', 'exp.extra': 'Additional experience',
      'exp1.role': 'IT Support Intern', 'exp1.date': 'January 2024 – July 2024',
      'exp1.b1': 'Troubleshooting computers and networks in the workplace.',
      'exp1.b2': 'Pulling and crimping UTP cables at the Universitas Indonesia Library Laboratory.',
      'exp1.b3': 'Installing and configuring CCTV devices and LAN networks.',
      'exp1.b4': 'Creating and documenting network topologies using Microsoft Visio.',
      'exp1.b5': 'Performing basic Linux administration, including users, services, and networking.',
      'exp1.b6': 'Managing basic virtualization using Virtual Machines.',
      'exp2.date': 'February 2026 – Present',
      'exp2.b1': 'Managing a YouTube channel, including editing, uploading, and content optimization.',
      'exp2.b2': 'Using CapCut or other editing software.',
      'exp2.b3': 'Creating short-form video content to increase engagement.',
      'exp2.b4': 'Creating and uploading content consistently.',
      'cv.desc': 'A summary of my profile, work experience, school projects, academic history, and certifications on a single PDF page.',
      'cv.meta': 'PDF · 1 page', 'cv.view': 'View CV', 'cv.download': 'Download CV',
      'nav.home': 'Home', 'nav.about': 'About', 'nav.skills': 'Skills', 'nav.certs': 'Certificates', 'nav.contact': 'Contact',
      'menu.open': 'Open menu', 'menu.close': 'Close menu',
      'theme.toLight': 'Switch to light mode', 'theme.toDark': 'Switch to dark mode',
      'hero.desc': "I'm interested in technology, especially computer networking, and I keep deepening my knowledge and skills in this field.",
      'hero.cta1': 'Contact me', 'hero.cta2': 'View certificates',
      'hero.photoAlt': 'Photo of Muhammad Rizky Fadillah',
      'net.tag': 'Network topology', 'net.note': 'Illustration · not live data',
      'net.cap': 'Data flow from local devices to the internet. Hover over a device, or tap one, to see its role.',
      'net.aria.d': 'Network topology illustration: workstation and laptop connect to a network switch, then to a router and finally the internet. A server connects to the switch.',
      'net.aria.m': 'Network topology illustration: workstation, laptop, and server connect to a network switch, then to a router and the internet.',
      'dev.workstation': 'Workstation: desktop computer with a monitor',
      'dev.laptop': 'Laptop: client device',
      'dev.switch': 'Network switch: connects devices on the local network',
      'dev.server': 'Server: server rack connected to the switch',
      'dev.router': 'Router: connects the local network to the internet, with a Wi-Fi signal',
      'dev.internet': 'Internet gateway: the way out to the internet and the cloud',
      'info.workstation': 'Desktop computer as the starting point of data traffic on the local network.',
      'info.laptop': 'Client device connected to the switch to access the network.',
      'info.switch': 'Connects devices within one local network and forwards data to the right destination.',
      'info.server': 'Provides services and storage for devices on the network.',
      'info.router': 'Connects the local network to the internet; the signal above it marks wireless access (Wi-Fi).',
      'info.internet': 'The way out to the internet and cloud services.',
      'idx.profile': 'Profile', 'idx.skills': 'Competencies', 'idx.docs': 'Documents', 'idx.contact': 'Contact',
      'about.title': 'About me',
      'about.lead': 'Graduate of SMK Wikrama Bogor, majoring in Computer Network and Telecommunication Engineering (TJKT), with a strong interest in networking and network security.',
      'about.p2': "I have interned at a local IT company, and I'm used to handling troubleshooting, network installation, and server configuration. I'm eager to keep learning and growing in the IT world, and ready to contribute my best through the skills I have.",
      'about.p3': 'Outside of that, I enjoy reading books about technology, trying out various computer networking tools, and having a cup of coffee in the morning. I also like adding to my knowledge through online training and certificates.',
      'facts.edu': 'Education', 'facts.edu.val': 'SMK Wikrama Bogor, Computer Network and Telecommunication Engineering (TJKT)', 'facts.focus': 'Focus',
      'skills.title': 'Skills',
      'skill.a': 'Systems & virtualization', 'skill.b': 'Networking & wireless', 'skill.c': 'Cloud & security', 'skill.infra': 'IT Infrastructure',
      'certs.title': 'Certificates & training',
      'certs.desc': 'Select a certificate to enlarge it. The original PDF is available inside.',
      'cert.mtcna': 'MTCNA certificate', 'cert.jc': 'Junior Cybersecurity certificate', 'cert.linux': 'Linux Fundamental certificate',
      'cert.ntc': 'Network Technician Career certificate', 'cert.k3': 'E-Learning K3 certificate for Muhammad Rizky Fadillah', 'cert.vm': 'Virtual Machine certificate',
      'contact.title': "Let's talk.",
      'contact.desc': "I'm open to new opportunities. Send a message through the form, or reach me through one of the channels below.",
      'form.name': 'Name', 'form.name.ph': 'Your full name', 'form.msg': 'Message', 'form.msg.ph': 'Write your message here', 'form.send': 'Send message',
      'lb.aria': 'Certificate preview', 'lb.pdf': 'Open PDF', 'lb.close': 'Close', 'lb.close.aria': 'Close preview',
      'meta.desc': 'Portfolio of Muhammad Rizky Fadillah, a graduate of SMK Wikrama Bogor majoring in Computer Network and Telecommunication Engineering (TJKT), focused on networking and cyber security.',
      'status.sending': 'Sending message…',
      'status.ok': "Message sent. Thank you, I'll reply soon.",
      'status.fail': 'Message could not be sent. Please try again.',
      'status.net': 'Could not reach the server. Check your connection and try again, or contact me via WhatsApp.',
      'val.required': 'Please fill out this field.', 'val.email': 'Please enter a valid email address.'
    }
  };
  /* Teks Indonesia untuk elemen ber-data-i18n diambil dari HTML aslinya */
  const textItems = $$('[data-i18n]').map(el => ({ el, key: el.dataset.i18n, id: el.textContent }));
  const attrItems = [];
  $$('[data-i18n-attr]').forEach(el => el.dataset.i18nAttr.split(';').forEach(p => {
    const [a, k] = p.split(':');
    attrItems.push({ el, a, k, id: el.getAttribute(a) });
  }));
  const metaDesc = $('meta[name="description"]');
  const metaDescId = metaDesc ? metaDesc.getAttribute('content') : '';
  const themeMeta = $('meta[name="theme-color"]');
  const themeBtn = $('#themeBtn');
  let lang = root.lang === 'en' ? 'en' : 'id';

  function t(key) {
    const v = STR[lang] && STR[lang][key];
    return v != null ? v : (STR.id[key] != null ? STR.id[key] : '');
  }

  function applyLang(l, save) {
    lang = l === 'en' ? 'en' : 'id';
    root.lang = lang;
    if (save) store.set('rf-lang', lang);
    textItems.forEach(i => { i.el.textContent = lang === 'en' && STR.en[i.key] != null ? STR.en[i.key] : i.id; });
    attrItems.forEach(i => { i.el.setAttribute(i.a, lang === 'en' && STR.en[i.k] != null ? STR.en[i.k] : i.id); });
    if (metaDesc) metaDesc.setAttribute('content', lang === 'en' ? STR.en['meta.desc'] : metaDescId);
    $$('.lang-btn').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
    toggle.setAttribute('aria-label', t(list.classList.contains('open') ? 'menu.close' : 'menu.open'));
    refreshCap();
    renderStatus();
    paintTheme();
  }
  function paintTheme() {
    const light = root.dataset.theme === 'light';
    themeBtn.setAttribute('aria-label', t(light ? 'theme.toDark' : 'theme.toLight'));
    if (themeMeta) themeMeta.setAttribute('content', light ? '#F4F3EE' : '#0E1012');
  }
  function applyTheme(th, save) {
    root.dataset.theme = th === 'light' ? 'light' : 'dark';
    if (save) store.set('rf-theme', root.dataset.theme);
    paintTheme();
  }
  $$('.lang-btn').forEach(b => b.addEventListener('click', () => { if (b.dataset.lang !== lang) applyLang(b.dataset.lang, true); }));
  themeBtn.addEventListener('click', () => applyTheme(root.dataset.theme === 'light' ? 'dark' : 'light', true));
  applyLang(lang, false);
  applyTheme(root.dataset.theme === 'light' ? 'light' : 'dark', false);

  /* ===== Animasi foto profil: idle (CSS) + interaksi halus saat hover mouse / ketuk di layar sentuh ===== */
  const vis = $('.hero-visual');
  if (vis) {
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(es => es.forEach(e => vis.classList.toggle('in-view', e.isIntersecting))).observe(vis);
    } else {
      vis.classList.add('in-view');
    }
    const calm = matchMedia('(prefers-reduced-motion: reduce)');
    let raf = 0, nx = 0, ny = 0;
    const paint = () => { raf = 0; vis.style.setProperty('--px', nx.toFixed(3)); vis.style.setProperty('--py', ny.toFixed(3)); };
    vis.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse' && !calm.matches) vis.classList.add('is-hover'); });
    vis.addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse' || calm.matches) return;
      const r = vis.getBoundingClientRect();
      nx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width - .5) * 2));
      ny = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height - .5) * 2));
      if (!raf) raf = requestAnimationFrame(paint);
    });
    vis.addEventListener('pointerleave', () => { vis.classList.remove('is-hover'); nx = ny = 0; paint(); });
    vis.addEventListener('pointerdown', e => {
      if (e.pointerType === 'mouse' || calm.matches) return;
      vis.classList.remove('glint'); void vis.offsetWidth; vis.classList.add('glint');
    });
    vis.addEventListener('animationend', e => { if (e.animationName === 'photo-glint') vis.classList.remove('glint'); });
  }
})();
