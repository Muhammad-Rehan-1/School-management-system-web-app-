import React, { useState } from 'react'
import { useStore } from '../store/useStore'
import './Modal.css'

export default function AddStudentModal({ onClose }){
  const { addStudent } = useStore()
  const [form, setForm] = useState({ name: '', father: '', roll: '', address: '', contact: '', email: '', admissionFees: '', monthlyFees:'', classGrade: '', gender: '', dob: '', enrollmentDate: '', bForm: null })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(null)
  const [saveError, setSaveError] = useState(null)

  function onChange(e){
    const { name, value, files } = e.target
    if(name === 'bForm' && files){
      const next = { ...form, bForm: files[0] }
      setForm(next)
      validate(next)
      return
    }
    const next = { ...form, [name]: value }
    setForm(next)
    validate(next)
  }

  const validate = React.useCallback((data) => {
    const d = data || {}
    const e = {}
    if(!d.name) e.name = 'Required'
    if(!d.father) e.father = 'Required'
    if(!d.contact) e.contact = 'Required'
    if(!d.email) e.email = 'Required'
    else if(!/^\S+@\S+\.\S+$/.test(d.email)) e.email = 'Invalid email'
    if(!d.address) e.address = 'Required'
    if(!d.admissionFees || isNaN(Number(d.admissionFees))) e.admissionFees = 'Enter numeric admission fees'
    if(!d.monthlyFees || isNaN(Number(d.monthlyFees))) e.monthlyFees = 'Enter numeric monthly fees'
    if(!d.classGrade) e.classGrade = 'Required'
    if(!d.gender) e.gender = 'Required'
    if(!d.dob) e.dob = 'Required'
    if(!d.enrollmentDate) e.enrollmentDate = 'Required'
    // B-Form upload is optional
    setErrors(e)
    return Object.keys(e).length === 0
  }, [])

  React.useEffect(()=>{ validate(form) }, [form, validate])

  async function submit(e){
    e.preventDefault()
    if(!validate(form)) return
    setSaving(true)
    setSaveError(null)
    setUploadProgress(0)
    try{
      const admission = Number(form.admissionFees || 0)
      const monthly = Number(form.monthlyFees || 0)
      const paid = 0
      const data = { ...form, admissionFees: admission, monthlyFees: monthly, paid, payments: form.payments || {} }
      await addStudent(data, (p)=> setUploadProgress(p))
      onClose()
    }catch(err){
      console.error('save student failed', err)
      setSaveError(err?.message || 'Save failed')
    }finally{ setSaving(false); setUploadProgress(null) }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header">
          <h3>Add New Student</h3>
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
            <input name="roll" placeholder="Assign Roll no" value={form.roll} onChange={onChange} />
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
            <input name="admissionFees" type="text" placeholder="Admission fees *" value={form.admissionFees} onChange={onChange} />
            {errors.admissionFees && <small className="error">{errors.admissionFees}</small>}
          </div>

          <div className="field">
            <input name="monthlyFees" type="text" placeholder="Monthly fees *" value={form.monthlyFees} onChange={onChange} />
            {errors.monthlyFees && <small className="error">{errors.monthlyFees}</small>}
          </div>          <div className="field">
            <select name="gender" value={form.gender} onChange={onChange}>
              <option value="">Student Gender *</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            {errors.gender && <small className="error">{errors.gender}</small>}
          </div>

          <div className="field">
            <select name="classGrade" value={form.classGrade} onChange={onChange}>
              <option value="">Class Grade *</option>
              <option value="Play Group">Play Group</option>
              <option value="Nursery">Nursery</option>
              <option value="Prep">Prep</option>
              <option value="One">One</option>
              <option value="Two">Two</option>
              <option value="Three">Three</option>
              <option value="Four">Four</option>
              <option value="Five">Five</option>
              <option value="Six">Six</option>
              <option value="Seven">Seven</option>
              <option value="Eight">Eight</option>
              <option value="Nine">Nine</option>
            </select>
            {errors.classGrade && <small className="error">{errors.classGrade}</small>}
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
            <label>Add B-Form (optional)</label>
            <input type="file" name="bForm" accept=".pdf,.jpg,.png" onChange={onChange} />
            {form.bForm && <small>{form.bForm.name || form.bForm}</small>}
            {errors.bForm && <small className="error">{errors.bForm}</small>}
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
