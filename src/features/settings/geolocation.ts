/** Position de l'appareil, demandée seulement au clic sur « Utiliser ma position ». */
export function getPosition(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('unavailable'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (p) =>
        resolve({
          lat: Math.round(p.coords.latitude * 10_000) / 10_000,
          lng: Math.round(p.coords.longitude * 10_000) / 10_000,
        }),
      reject,
      { enableHighAccuracy: false, timeout: 15_000, maximumAge: 600_000 },
    )
  })
}
