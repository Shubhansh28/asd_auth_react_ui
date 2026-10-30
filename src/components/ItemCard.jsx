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

export default function ItemCard({ item, onOpen }) {
  const icon = iconByType[item.type?.toLowerCase()] || '✦'
  const isClaimed = item.status === 'claimed'
  const publisherName = item.user?.username || item.username || 'Community member'

  return (
    <article className="item-card" role="button" tabIndex="0" onClick={() => onOpen(item)} onKeyDown={(event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        onOpen(item)
      }
    }} aria-label={`View details for ${item.name}`}>
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
      <p className="item-publisher">Posted by <strong>{publisherName}</strong></p>
      <div className="item-footer"><span>Contact</span><a href={`mailto:${item.contact}`} onClick={(event) => event.stopPropagation()}>{item.contact}</a></div>
    </article>
  )
}
