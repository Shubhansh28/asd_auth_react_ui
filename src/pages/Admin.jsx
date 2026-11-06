import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import ItemForm from '../components/ItemForm'
import Modal from '../components/Modal'
import { getUserHistory, getUserOverview, updateUserRole } from '../api/admin'
import { deleteItem, updateItemStatus } from '../api/items'

function formatDateTime(value) {
  if (!value) return 'Not available'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Not available'
  return date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

function ItemHistory({ items, onEdit, onStatusChange, onDelete, busy }) {
  if (!items?.length) return <div className="admin-empty compact-empty">This member has not published any reports.</div>

  return <div className="history-list">
    {items.map((item) => {
      const isClaimed = item.status === 'claimed'
      return <article className="history-item" key={item.id}>
        <div className="history-item-top">
          <div><p className="item-type">{item.type}</p><h3>{item.name}</h3></div>
          <span className={`status-pill ${isClaimed ? 'claimed' : ''}`}>{item.status}</span>
        </div>
        <dl className="history-item-details">
          <div><dt>Last seen</dt><dd>{item.place}</dd></div>
          <div><dt>Contact</dt><dd>{item.contact}</dd></div>
          <div><dt>Published</dt><dd>{formatDateTime(item.createdAt)}</dd></div>
        </dl>
        <div className="history-actions">
          <button type="button" className="glass-button" disabled={busy} onClick={() => onEdit(item)}>Edit</button>
          <button type="button" className="claim-button" disabled={busy} onClick={() => onStatusChange(item, isClaimed ? 'open' : 'claimed')}>{busy ? 'Saving…' : isClaimed ? 'Mark active' : 'Mark returned'}</button>
          <button type="button" className="delete-button" disabled={busy} onClick={() => onDelete(item)}>Delete</button>
        </div>
      </article>
    })}
  </div>
}

export default function Admin({ currentUser, onLogout, onSessionChanged }) {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [usersError, setUsersError] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [history, setHistory] = useState(null)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [historyError, setHistoryError] = useState('')
  const [editingItem, setEditingItem] = useState(null)
  const [changingRoleId, setChangingRoleId] = useState(null)
  const [roleMessage, setRoleMessage] = useState('')
  const [actionError, setActionError] = useState('')
  const [isItemActioning, setIsItemActioning] = useState(false)
  const [isFormDirty, setIsFormDirty] = useState(false)

  const loadOverview = useCallback(async () => {
    setLoadingUsers(true)
    setUsersError('')
    try {
      setUsers(await getUserOverview())
    } catch (error) {
      setUsersError(error.message)
    } finally {
      setLoadingUsers(false)
    }
  }, [])

  useEffect(() => { loadOverview() }, [loadOverview])

  const loadHistory = useCallback(async (userId) => {
    setLoadingHistory(true)
    setHistoryError('')
    try {
      const result = await getUserHistory(userId)
      setHistory(result)
      setSelectedUser(result)
      return result
    } catch (error) {
      setHistoryError(error.message)
      return null
    } finally {
      setLoadingHistory(false)
    }
  }, [])

  async function openHistory(user) {
    setSelectedUser(user)
    setHistory(null)
    setActionError('')
    await loadHistory(user.id)
  }

  function closeHistory() {
    setSelectedUser(null)
    setHistory(null)
    setHistoryError('')
    setActionError('')
  }

  async function handleRoleChange(user, role) {
    if (role === user.role) return
    if (!window.confirm(`Change ${user.username}'s role to ${role}?`)) return

    setChangingRoleId(user.id)
    setRoleMessage('')
    setUsersError('')
    try {
      const { updatedUser } = await updateUserRole(user.id, role)
      setUsers((current) => current.map((entry) => entry.id === user.id ? { ...entry, role: updatedUser.role } : entry))
      setRoleMessage(`${updatedUser.username} is now ${updatedUser.role === 'admin' ? 'an admin' : 'a user'}.`)
      setHistory((current) => current?.id === user.id ? { ...current, role: updatedUser.role } : current)
      setSelectedUser((current) => current?.id === user.id ? { ...current, role: updatedUser.role } : current)

      if (user.id === currentUser.id) {
        await onSessionChanged()
        if (role !== 'admin') {
          setRoleMessage('Your admin access was removed. Returning to the items page…')
          setTimeout(() => navigate('/items', { replace: true }), 1200)
        }
      }
    } catch (error) {
      setUsersError(error.message)
    } finally {
      setChangingRoleId(null)
    }
  }

  async function refreshSelectedUser() {
    if (selectedUser) await loadHistory(selectedUser.id)
    await loadOverview()
  }

  async function handleItemStatus(item, status) {
    setActionError('')
    setIsItemActioning(true)
    try {
      await updateItemStatus(item.id, status)
      await refreshSelectedUser()
    } catch (error) {
      setActionError(error.message)
    } finally {
      setIsItemActioning(false)
    }
  }

  async function handleItemDelete(item) {
    if (!window.confirm(`Delete “${item.name}”? This cannot be undone.`)) return
    setActionError('')
    setIsItemActioning(true)
    try {
      await deleteItem(item.id)
      await refreshSelectedUser()
    } catch (error) {
      setActionError(error.message)
    } finally {
      setIsItemActioning(false)
    }
  }

  async function handleItemSaved() {
    setEditingItem(null)
    setIsFormDirty(false)
    await refreshSelectedUser()
  }

  function closeEditor() {
    if (isFormDirty && !window.confirm('Discard your unsaved changes?')) return
    setEditingItem(null)
    setIsFormDirty(false)
  }

  return <main className="admin-page">
    <Navbar user={currentUser} onLogout={onLogout} />
    <section className="admin-hero">
      <div><p className="eyebrow"><span className="eyebrow-dot" /> Admin workspace</p><h1>Community <em>care</em>,<br />at a glance.</h1><p>Review members, keep reports accurate, and help every item find its way home.</p></div>
      <div className="admin-hero-mark" aria-hidden="true">✦</div>
    </section>
    <section className="admin-content">
      <div className="admin-heading"><div><p className="eyebrow">Members</p><h2>Community overview <span>({users.length})</span></h2></div><button className="refresh-button" type="button" onClick={loadOverview} disabled={loadingUsers}>↻ Refresh</button></div>
      {roleMessage && <p className="form-success" role="status">{roleMessage}</p>}
      {loadingUsers && <div className="state-card">Loading member overview…</div>}
      {usersError && <div className="state-card error-state"><p>{usersError}</p><button className="text-button" type="button" onClick={loadOverview}>Try again →</button></div>}
      {!loadingUsers && !usersError && users.length === 0 && <div className="admin-empty"><span className="empty-star">✦</span><h3>No members yet.</h3><p>Accounts will appear here once people join the community.</p></div>}
      {!loadingUsers && !usersError && users.length > 0 && <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Member</th><th>Role</th><th>Reports</th><th>Active</th><th>Claimed</th><th>Joined</th><th>Last updated</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{users.map((user) => <tr key={user.id}><td data-label="Member"><strong>{user.username}</strong></td><td data-label="Role"><span className={`role-pill ${user.role}`}>{user.role}</span></td><td data-label="Reports">{user.totalItems}</td><td data-label="Active"><span className="count-open">{user.totalOpenItems}</span></td><td data-label="Claimed"><span className="count-claimed">{user.totalClaimedItems}</span></td><td data-label="Joined">{formatDateTime(user.dateCreated)}</td><td data-label="Last updated">{formatDateTime(user.updatedAt)}</td><td className="admin-row-actions"><button className="text-button" type="button" onClick={() => openHistory(user)}>View history</button><label className="role-select"><span className="sr-only">Change {user.username}'s role</span><select value={user.role} disabled={changingRoleId === user.id} onChange={(event) => handleRoleChange(user, event.target.value)}><option value="user">User</option><option value="admin">Admin</option></select></label></td></tr>)}</tbody></table></div>}
    </section>

    {selectedUser && !editingItem && <Modal title={`${selectedUser.username}'s history`} eyebrow="Member profile" onClose={closeHistory}>
      {loadingHistory && <div className="state-card compact-state">Loading this member’s reports…</div>}
      {historyError && <div className="state-card error-state compact-state"><p>{historyError}</p><button className="text-button" type="button" onClick={() => loadHistory(selectedUser.id)}>Try again →</button></div>}
      {!loadingHistory && !historyError && history && <div className="admin-profile"><div className="profile-summary"><div><span>Role</span><strong className={`role-pill ${history.role}`}>{history.role}</strong></div><div><span>Joined</span><strong>{formatDateTime(history.dateCreated)}</strong></div><div><span>Last updated</span><strong>{formatDateTime(history.updatedAt)}</strong></div></div><div className="history-heading"><h3>All reports</h3><span>{history.items?.length || 0} total</span></div>{actionError && <p className="form-error" role="alert">{actionError}</p>}<ItemHistory items={history.items} busy={isItemActioning} onEdit={setEditingItem} onStatusChange={handleItemStatus} onDelete={handleItemDelete} /></div>}
    </Modal>}
    {editingItem && <Modal title={`Edit ${editingItem.name}`} eyebrow="Admin report editor" onClose={closeEditor}><ItemForm editingItem={editingItem} onSaved={handleItemSaved} onDirtyChange={setIsFormDirty} /></Modal>}
  </main>
}
