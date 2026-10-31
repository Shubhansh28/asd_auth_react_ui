import { useEffect, useState } from 'react'
import { createItem, updateItem } from '../api/items'

const initialItem = { name: '', type: '', place: '', contact: '' }

export default function ItemForm({ editingItem, onSaved }) {
  const isEditing = Boolean(editingItem)
  const [item, setItem] = useState(editingItem ? { name: editingItem.name, type: editingItem.type, place: editingItem.place, contact: editingItem.contact } : initialItem)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setItem(editingItem ? { name: editingItem.name, type: editingItem.type, place: editingItem.place, contact: editingItem.contact } : initialItem)
    setError('')
  }, [editingItem])

  function handleChange(event) {
    setItem((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      const changes = Object.fromEntries(Object.entries(item).filter(([field, value]) => value.trim() !== editingItem?.[field]))
      if (isEditing && Object.keys(changes).length === 0) {
        setError('Make a change before saving.')
        return
      }
      const savedItem = isEditing ? await updateItem(editingItem.id, changes) : await createItem(item)
      await onSaved(savedItem)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="item-form" onSubmit={handleSubmit}>
      <p className="form-intro">{isEditing ? 'Update the details below, then save your changes.' : 'A few details can make a big difference. All fields are required.'}</p>
      <label>Item name<input name="name" value={item.name} onChange={handleChange} placeholder="e.g. Blue water bottle" required /></label>
      <label>Category<input name="type" value={item.type} onChange={handleChange} placeholder="e.g. Personal item" required /></label>
      <label>Last seen at<input name="place" value={item.place} onChange={handleChange} placeholder="e.g. Library, first floor" required /></label>
      <label>Contact details<input name="contact" value={item.contact} onChange={handleChange} placeholder="Email or phone number" required /></label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="primary-button form-submit" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : isEditing ? 'Save changes' : 'Publish lost item'} <span>→</span></button>
    </form>
  )
}
