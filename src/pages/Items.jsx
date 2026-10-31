import { useCallback, useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import ItemCard from '../components/ItemCard'
import ItemForm from '../components/ItemForm'
import Modal from '../components/Modal'
import { deleteItem, getItems, updateItemStatus } from '../api/items'

export default function Items({ currentUser, onLogout }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)
  const [actionError, setActionError] = useState('')
  const [isActioning, setIsActioning] = useState(false)

  const loadItems = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setItems(await getItems())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadItems() }, [loadItems])

  function openCreateModal() {
    setEditingItem(null)
    setSelectedItem(null)
    setActionError('')
    setIsModalOpen(true)
  }

  function openEditModal(item) {
    setEditingItem(item)
    setSelectedItem(null)
    setActionError('')
    setIsModalOpen(true)
  }

  function openDetailsModal(item) {
    setEditingItem(null)
    setSelectedItem(item)
    setActionError('')
    setIsModalOpen(true)
  }

  function closeModal() {
    setIsModalOpen(false)
    setEditingItem(null)
    setSelectedItem(null)
    setActionError('')
  }

  async function handleSaved() {
    await loadItems()
    closeModal()
  }

  async function handleStatusChange(item, status) {
    setActionError('')
    setIsActioning(true)
    try {
      await updateItemStatus(item.id, status)
      await loadItems()
      closeModal()
    } catch (err) {
      setActionError(err.message)
    } finally {
      setIsActioning(false)
    }
  }

  async function handleDelete(item) {
    if (!window.confirm(`Delete “${item.name}”? This cannot be undone.`)) return

    setActionError('')
    setIsActioning(true)
    try {
      await deleteItem(item.id)
      await loadItems()
      closeModal()
    } catch (err) {
      setActionError(err.message)
    } finally {
      setIsActioning(false)
    }
  }

  const isOwner = selectedItem?.userId === currentUser?.id

  return (
    <main className="items-page">
      <Navbar user={currentUser} onLogout={onLogout} onReportItem={openCreateModal} />
      <section className="items-hero">
        <div><p className="eyebrow"><span className="eyebrow-dot" /> Community noticeboard</p><h1>Lost, but not<br /><em>forgotten.</em></h1><p>Browse the latest reports and help a lost item make its way back to where it belongs.</p></div>
        <button className="primary-button items-report" onClick={openCreateModal}>Report lost item <span>+</span></button>
      </section>
      <section className="items-content">
        <div className="items-heading"><div><p className="eyebrow">Latest reports</p><h2>Things looking for home <span>({items.length})</span></h2></div><button className="refresh-button" type="button" onClick={loadItems}>↻ Refresh</button></div>
        {loading && <div className="state-card">Gathering the latest reports…</div>}
        {error && <div className="state-card error-state"><p>{error}</p><button className="text-button" type="button" onClick={loadItems}>Try again →</button></div>}
        {!loading && !error && items.length === 0 && <div className="state-card"><span className="empty-star">✦</span><h3>No reports just yet.</h3><p>Be the first to report a lost item.</p><button className="primary-button" type="button" onClick={openCreateModal}>Report item <span>+</span></button></div>}
        {!loading && !error && items.length > 0 && <div className="items-grid">{items.map((item) => <ItemCard item={item} key={item.id} onOpen={openDetailsModal} />)}</div>}
      </section>
      {isModalOpen && selectedItem && <Modal title={selectedItem.name} eyebrow="Lost item details" onClose={closeModal}>
        <div className="item-detail">
          <span className="item-detail-status">{selectedItem.status || 'open'}</span>
          <dl>
            <div><dt>Category</dt><dd>{selectedItem.type}</dd></div>
            <div><dt>Last seen at</dt><dd>{selectedItem.place}</dd></div>
            <div><dt>Contact</dt><dd><a href={`mailto:${selectedItem.contact}`}>{selectedItem.contact}</a></dd></div>
            <div><dt>Published by</dt><dd>{selectedItem.user?.username || 'Community member'}</dd></div>
          </dl>
          {actionError && <p className="form-error" role="alert">{actionError}</p>}
          {isOwner && <div className="detail-actions">
            <button className="primary-button detail-edit" type="button" onClick={() => openEditModal(selectedItem)}>Edit this report <span>→</span></button>
            <button className="claim-button" type="button" disabled={isActioning} onClick={() => handleStatusChange(selectedItem, 'claimed')}>{isActioning ? 'Saving…' : 'Mark as returned'}</button>
            <button className="delete-button" type="button" disabled={isActioning} onClick={() => handleDelete(selectedItem)}>Delete report</button>
          </div>}
        </div>
      </Modal>}
      {isModalOpen && !selectedItem && <Modal title={editingItem ? 'Edit lost item' : 'Report a lost item'} eyebrow={editingItem ? 'Update report' : 'New report'} onClose={closeModal}><ItemForm editingItem={editingItem} onSaved={handleSaved} /></Modal>}
    </main>
  )
}
