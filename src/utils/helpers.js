export const fmt = (n) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(n)

export const discount = (price, compare) =>
  compare && compare > price
    ? Math.round(((compare - price) / compare) * 100)
    : 0

export const firstImage = (images) => {
  if (!images) return ''
  const arr = typeof images === 'string' ? JSON.parse(images) : images
  return arr?.[0]?.url || arr?.[0] || ''
}
