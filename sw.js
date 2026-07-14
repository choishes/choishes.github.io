const cacheName = 'game-v1';
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
  '/js/space.js',
  '/js/story.js',
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
  '/assets/story/char_syn_kaget.png',
  '/assets/story/char_syn_marah.png',
  '/assets/story/char_syn_normal.png',
  '/assets/story/char_syn_senyum.png',
  '/assets/story/char_vega_kaget.png',
  '/assets/story/char_vega_marah.png',
  '/assets/story/char_vega_normal.png',
  '/assets/story/char_vega_senyum.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      return cache.addAll(assets);
    })
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(response => {
      return response || fetch(e.request);
    })
  );
});
