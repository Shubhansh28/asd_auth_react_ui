const iconByType = {
  electronics: '⌁',
  keys: '⌘',
  wallet: '◒',
  clothing: '◇',
}

function formatDate(value) {
  if (!value) return 'Recently reported'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Recently reported' : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function ItemCard({ item }) {
  const icon = iconByType[item.type?.toLowerCase()] || '✦'
  const isClaimed = item.status === 'claimed'

  return (
    <article className="item-card">
      <div className="item-card-head">
        <span className="item-icon">{icon}</span>
        <span className={`status-pill ${isClaimed ? 'claimed' : ''}`}>{item.status || 'open'}</span>
      </div>
      <div>
        <p className="item-type">{item.type}</p>
        <h3>{item.name}</h3>
      </div>
      <div className="item-details">
        <p><span>⌖</span>{item.place}</p>
        <p><span>◷</span>{formatDate(item.createdAt)}</p>
      </div>
      <div className="item-footer"><span>Contact</span><a href={`mailto:${item.contact}`}>{item.contact}</a></div>
    </article>
  )
}
