import React, { useState } from 'react'
import { useStore } from '../store/useStore'
import './Modal.css'

export default function AddStaffModal({ onClose }){
  const { addStaff } = useStore()
  const [form, setForm] = useState({ name: '', father: '', address: '', contact: '', email: '', role: '', dob: '', enrollmentDate: '', cnic: null })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(null)
  const [saveError, setSaveError] = useState(null)

  const validate = React.useCallback((data) => {
    const d = data || {}
    const e = {}
    if(!d.name) e.name = 'Required'
    if(!d.father) e.father = 'Required'
    if(!d.contact) e.contact = 'Required'
    if(!d.email) e.email = 'Required'
    else if(!/^\S+@\S+\.\S+$/.test(d.email)) e.email = 'Invalid email'
    if(!d.address) e.address = 'Required'
    if(!d.role) e.role = 'Required'
    if(!d.dob) e.dob = 'Required'
    if(!d.enrollmentDate) e.enrollmentDate = 'Required'
    // CNIC upload is optional
    setErrors(e)
    return Object.keys(e).length === 0
  }, [])

  function onChange(e){
    const { name, value, files } = e.target
    if(name === 'cnic' && files){
      const next = { ...form, cnic: files[0] }
      setForm(next)
      validate(next)
      return
    }
    const next = { ...form, [name]: value }
    setForm(next)
    validate(next)
  }

  async function submit(e){
    e.preventDefault()
    if(!validate(form)) return
    setSaving(true)
    setSaveError(null)
    setUploadProgress(0)
    try{
      await addStaff(form, (p)=> setUploadProgress(p))
      onClose()
    }catch(err){
      console.error('save staff failed', err)
      setSaveError(err?.message || 'Save failed')
    }finally{ setSaving(false); setUploadProgress(null) }
  }

  React.useEffect(()=>{ validate(form) }, [form, validate])

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header">
          <h3>Add New Staff</h3>
          <button onClick={onClose}>X</button>
        </div>
        <form className="modal-body" onSubmit={submit}>
          <div className="field">
            <input name="name" placeholder="Full Name *" value={form.name} onChange={onChange} />
            {errors.name && <small className="error">{errors.name}</small>}
          </div>

          <div className="field">
            <input name="father" placeholder="Father Name *" value={form.father} onChange={onChange} />
            {errors.father && <small className="error">{errors.father}</small>}
          </div>

          <div className="field">
            <input name="contact" placeholder="Contact number *" value={form.contact} onChange={onChange} />
            {errors.contact && <small className="error">{errors.contact}</small>}
          </div>

          <div className="field">
            <input name="email" placeholder="Email *" value={form.email} onChange={onChange} />
            {errors.email && <small className="error">{errors.email}</small>}
          </div>

          <div className="field">
            <input name="address" placeholder="Current Address *" value={form.address} onChange={onChange} />
            {errors.address && <small className="error">{errors.address}</small>}
          </div>

          <div className="field">
            <input name="role" type="text" placeholder="Role of staff *" value={form.role} onChange={onChange} />
            {errors.role && <small className="error">{errors.role}</small>}
          </div>
          <div className="field">
            <label>Date of Birth</label>
            <input type="date" name="dob" value={form.dob} onChange={onChange} />
            {errors.dob && <small className="error">{errors.dob}</small>}
          </div>

          <div className="field">
            <label>Enrollment Date</label>
            <input type="date" name="enrollmentDate" value={form.enrollmentDate} onChange={onChange} />
            {errors.enrollmentDate && <small className="error">{errors.enrollmentDate}</small>}
          </div>

          <div className="field">
            <label>Add CNIC (optional)</label>
            <input type="file" name="cnic" accept=".pdf,.jpg,.png" onChange={onChange} />
            {form.cnic && <small>{form.cnic.name || form.cnic}</small>}
            {errors.cnic && <small className="error">{errors.cnic}</small>}
            {uploadProgress !== null && <div style={{marginTop:8}}>Uploading: {uploadProgress}%</div>}
            {saveError && <small className="error">{saveError}</small>}
          </div>
          <div className="modal-actions">
            <button type="submit" disabled={Object.keys(errors).length>0 || saving} aria-disabled={Object.keys(errors).length>0 || saving}>{saving ? 'Saving...' : 'Save'}</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}
