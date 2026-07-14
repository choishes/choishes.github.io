const cacheName = 'game-v8';
const assets = [
  '/',
  '/index.html',
  '/manifest.json',
  
  // icon pwa untuk android dan windows
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  
  // file script utama dari folder /js
  '/js/audio.js',
  '/js/bank.js',
  '/js/cine.js',
  '/js/ending.js',
  '/js/game.js',
  '/js/leaderboard.js',
  '/js/naskah.js',
  '/js/online.js',
  '/js/paket.js',
  '/js/paket_ekstra.js',
  '/js/space.js',
  '/js/story.js',
  '/js/profil.js',
  '/js/version.js',

  // file audio background musik dari folder /assets/bgm
  '/assets/bgm/Cinematic_Conflict_and_Resolution.mp3',
  '/assets/bgm/Cinematic_Retro_Synth_Progression.mp3',
  '/assets/bgm/Cinematic_Title_Sequence_Composition_Guide.mp3',
  '/assets/bgm/Cold_Light_of_Dawn.mp3',
  '/assets/bgm/Melancholic_Emotional_Musical_Composition.mp3',
  '/assets/bgm/Observing_the_Glass_Moon.mp3',
  '/assets/bgm/Optimistic_Game_Soundtrack_Composition_Guide.mp3',
  '/assets/bgm/The_Third_Moon.mp3',

  // file gambar ilustrasi dari folder /assets/img
  '/assets/img/ai_art.jpg',
  '/assets/img/ai_human.jpg',
  '/assets/img/ai_human_2_.jpg',
  '/assets/img/ai_machine.jpg',
  '/assets/img/ai_machine_2_.jpg',
  '/assets/img/ai_park.jpg',
  '/assets/img/ai_scenery.jpg',
  '/assets/img/ai_scenery_2_.jpg',
  '/assets/img/human_art.jpg',
  '/assets/img/human_art_2_.jpg',
  '/assets/img/human_human.jpg',
  '/assets/img/human_human_2_.jpg',
  '/assets/img/human_machine.jpg',
  '/assets/img/human_park.jpg',
  '/assets/img/human_scenery.jpg',
  '/assets/img/human_scenery_2_.jpg',

  // file aset cerita (background dan karakter) dari folder /assets/story
  '/assets/story/bg_kota.jpg',
  '/assets/story/bg_lab.jpg',
  '/assets/story/bg_redaksi.jpg',
  '/assets/story/bg_server.jpg',
  '/assets/story/bg_void.jpg',
  '/assets/story/char_arga_kaget.png',
  '/assets/story/char_arga_marah.png',
  '/assets/story/char_arga_normal.png',
  '/assets/story/char_arga_senyum.png',
  '/assets/story/char_dira_kaget.png',
  '/assets/story/char_dira_marah.png',
  '/assets/story/char_dira_normal.png',
  '/assets/story/char_dira_senyum.png',
  '/assets/story/char_sari_kaget.png',
  '/assets/story/char_sari_marah.png',
  '/assets/story/char_sari_normal.png',
  '/assets/story/char_sari_senyum.png',
  '/assets/story/char_syn_kaget.png',
  '/assets/story/char_syn_marah.png',
  '/assets/story/char_syn_normal.png',
  '/assets/story/char_syn_senyum.png',
  '/assets/story/char_vega_kaget.png',
  '/assets/story/char_vega_marah.png',
  '/assets/story/char_vega_normal.png',
  '/assets/story/char_vega_senyum.png',
  '/assets/story/cuts_archive_open.jpg',
  '/assets/story/cuts_arga_mother.jpg',
  '/assets/story/cuts_dira_envelope.jpg',
  '/assets/story/cuts_dira_fake.jpg',
  '/assets/story/cuts_sari_ai.jpg',
  '/assets/story/cuts_sari_book.jpg',
  '/assets/story/cuts_syn_deprecated.jpg'
];

self.addEventListener('install', e => {
  // Precache per-file, JANGAN addAll. addAll bersifat atomik: kalau SATU
  // file 404 (mis. gambar Sari yang belum dibuat), seluruh precache gagal
  // dan tak ada yang tersimpan, sehingga semua aset selalu ambil dari
  // jaringan (inilah salah satu sebab gambar terasa telat). allSettled
  // membuat file yang hilang dilewati tanpa menggagalkan sisanya.
  self.skipWaiting();
  e.waitUntil(
    caches.open(cacheName).then(cache =>
      Promise.allSettled(assets.map(url => cache.add(url)))
    )
  );
});

self.addEventListener('activate', e => {
  // Buang cache versi lama supaya update JS/gambar benar-benar terpakai.
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== cacheName).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        // Simpan aset yang berhasil diambil (termasuk gambar yang belum
        // sempat di-precache, mis. Sari setelah filenya diunggah) supaya
        // kunjungan berikutnya instan dari cache.
        if (res && res.ok && res.type === 'basic') {
          const copy = res.clone();
          caches.open(cacheName).then(c => c.put(e.request, copy));
        }
        return res;
      }).catch(() => cached);
    })
  );
});
