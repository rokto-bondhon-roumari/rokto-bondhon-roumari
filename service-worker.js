const CACHE_NAME = "rokto-bondhon-v2";

const BASE_PATH = "/rokto-bondhon-roumari/";

const FILES_TO_CACHE = [
  BASE_PATH,
  BASE_PATH + "index.html",
  BASE_PATH + "register.html",
  BASE_PATH + "search.html",
  BASE_PATH + "sujon.jpg",
  BASE_PATH + "icon.svg",
  BASE_PATH + "manifest.webmanifest"
];

// অ্যাপের প্রয়োজনীয় ফাইল সংরক্ষণ
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );

  self.skipWaiting();
});

// পুরোনো ক্যাশ পরিষ্কার
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );

  self.clients.claim();
});

// পেজ খোলার সময় ইন্টারনেট থেকে নতুন কপি নেওয়ার চেষ্টা
self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (
    request.method !== "GET" ||
    new URL(request.url).origin !== self.location.origin
  ) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, copy);
          });
          return response;
        })
        .catch(async () => {
          return (
            await caches.match(request)
          ) || caches.match(BASE_PATH + "index.html");
        })
    );
  }
});
