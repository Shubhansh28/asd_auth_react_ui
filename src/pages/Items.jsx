import { useCallback, useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import ItemCard from '../components/ItemCard'
import ItemForm from '../components/ItemForm'
import Modal from '../components/Modal'
import { getItems } from '../api/items'
import { getUser } from '../utils/auth'

export default function Items() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const currentUser = getUser()

  const loadItems = useCallback(async () => {
    setLoading(true)
    setError('')
    try { setItems(await getItems()) } catch (err) { setError(err.message) } finally { setLoading(false) }
  }, [])

  useEffect(() => { loadItems() }, [loadItems])

  function openCreateModal() {
    setEditingItem(null)
    setIsModalOpen(true)
  }

  function openEditModal(item) {
    setEditingItem(item)
    setIsModalOpen(true)
  }

  function handleSaved(savedItem) {
    setItems((current) => editingItem ? current.map((item) => item.id === savedItem.id ? { ...item, ...savedItem } : item) : [savedItem, ...current])
    setIsModalOpen(false)
    setEditingItem(null)
  }

  return (
    <main className="items-page">
      <Navbar onReportItem={openCreateModal} />
      <section className="items-hero">
        <div><p className="eyebrow"><span className="eyebrow-dot" /> Community noticeboard</p><h1>Lost, but not<br /><em>forgotten.</em></h1><p>Browse the latest reports and help a lost item make its way back to where it belongs.</p></div>
        <button className="primary-button items-report" onClick={openCreateModal}>Report lost item <span>+</span></button>
      </section>
      <section className="items-content">
        <div className="items-heading"><div><p className="eyebrow">Latest reports</p><h2>Things looking for home <span>({items.length})</span></h2></div><button className="refresh-button" type="button" onClick={loadItems}>↻ Refresh</button></div>
        {loading && <div className="state-card">Gathering the latest reports…</div>}
        {error && <div className="state-card error-state"><p>{error}</p><button className="text-button" type="button" onClick={loadItems}>Try again →</button></div>}
        {!loading && !error && items.length === 0 && <div className="state-card"><span className="empty-star">✦</span><h3>No reports just yet.</h3><p>Be the first to report a lost item.</p><button className="primary-button" type="button" onClick={openCreateModal}>Report item <span>+</span></button></div>}
        {!loading && !error && items.length > 0 && <div className="items-grid">{items.map((item) => <ItemCard item={item} key={item.id} canEdit={item.userId === currentUser?.id} onEdit={openEditModal} />)}</div>}
      </section>
      {isModalOpen && <Modal title={editingItem ? 'Edit lost item' : 'Report a lost item'} onClose={() => { setIsModalOpen(false); setEditingItem(null) }}><ItemForm editingItem={editingItem} onSaved={handleSaved} /></Modal>}
    </main>
  )
}
