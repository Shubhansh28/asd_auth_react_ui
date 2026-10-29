import { useState } from 'react'
import { createItem } from '../api/items'

const initialItem = { name: '', type: '', place: '', contact: '' }

export default function ItemForm({ onCreated }) {
  const [item, setItem] = useState(initialItem)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleChange(event) {
    setItem((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      const createdItem = await createItem(item)
      onCreated(createdItem)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="item-form" onSubmit={handleSubmit}>
      <p className="form-intro">A few details can make a big difference. All fields are required.</p>
      <label>Item name<input name="name" value={item.name} onChange={handleChange} placeholder="e.g. Blue water bottle" required /></label>
      <label>Category<input name="type" value={item.type} onChange={handleChange} placeholder="e.g. Personal item" required /></label>
      <label>Last seen at<input name="place" value={item.place} onChange={handleChange} placeholder="e.g. Library, first floor" required /></label>
      <label>Contact details<input name="contact" value={item.contact} onChange={handleChange} placeholder="Email or phone number" required /></label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="primary-button form-submit" disabled={isSubmitting}>{isSubmitting ? 'Publishing…' : 'Publish lost item'} <span>→</span></button>
    </form>
  )
}
