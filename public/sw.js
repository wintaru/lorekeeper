self.addEventListener('push', (event) => {
  if (!event.data) return

  const payload = event.data.json()
  const title = payload.title ?? 'LoreKeeper'
  const options = {
    body: payload.body ?? '',
    vibrate: [200, 100, 200],
    data: payload.data ?? {},
    requireInteraction: true,
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const campaignCode = event.notification.data?.campaignCode
  const url = campaignCode ? `/play/campaign/${campaignCode}` : '/'
  event.waitUntil(clients.openWindow(url))
})
