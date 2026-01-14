import React, { createContext, useContext, useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

// NOTE: Firebase has been removed. This module now uses localStorage as the canonical store.
// It implements the same public functions used by the app: addStudent, addStaff, updateStudent, updateStaff
// File uploads are converted to data URLs and persisted in localStorage under `uploads/<path>`.

const StoreContext = createContext()

export function StoreProvider({ children }) {
  const [students, setStudents] = useState(() => {
    try{
      const s = localStorage.getItem('students')
      return s ? JSON.parse(s) : []
    }catch(err){
      console.error('parse students', err)
      return []
    }
  })

  const [staff, setStaff] = useState(() => {
    try{
      const t = localStorage.getItem('staff')
      return t ? JSON.parse(t) : []
    }catch(err){
      console.error('parse staff', err)
      return []
    }
  })

  // Keep local cache in sync
  useEffect(() => { localStorage.setItem('students', JSON.stringify(students)) }, [students])
  useEffect(() => { localStorage.setItem('staff', JSON.stringify(staff)) }, [staff])

  const MONTHS = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec']
  const API = import.meta.env.VITE_API_URL || 'http://localhost:4000'

  // Helper: POST multipart to upload file to server
  async function uploadToServer(file, ownerType, ownerId){
    if(!file) return null
    const fd = new FormData()
    fd.append('file', file)
    fd.append('ownerType', ownerType)
    fd.append('ownerId', ownerId || '')
    const res = await fetch(`${API}/api/uploads`, { method: 'POST', body: fd })
    if(!res.ok) throw new Error('upload failed')
    return res.json()
  }

  // Helper: Save a file as a data URL in localStorage (used when server is unavailable)
  async function uploadFile(path, file, onProgress){
    if(!file) return null
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onprogress = (e) => { if(onProgress && e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100)) }
      reader.onerror = () => reject(new Error('file read failed'))
      reader.onload = () => {
        const dataUrl = reader.result
        try{
          localStorage.setItem(`uploads/${path}`, dataUrl)
        }catch(err){
          console.warn('saving upload to localStorage failed', err)
        }
        resolve(dataUrl)
      }
      reader.readAsDataURL(file)
    })
  }

  // Auth state (token + user)
  const [token, setToken] = useState(() => localStorage.getItem('token') || null)
  const [user, setUser] = useState(() => {
    try{ const u = localStorage.getItem('user'); return u ? JSON.parse(u) : null }catch(e){ return null }
  })

  // Fetch initial data from server (fallback to localStorage on failure)
  useEffect(() => {
    (async () => {
      try{
        const headers = token ? { 'Authorization': `Bearer ${token}` } : undefined

        // if token exists, fetch current user
        if(token){
          try{
            const me = await fetch(`${API}/auth/me`, { headers })
            if(me.ok){ const u = await me.json(); setUser(u); localStorage.setItem('user', JSON.stringify(u)) }
          }catch(e){ console.warn('fetch /auth/me failed', e) }
        }

        const [sRes, tRes] = await Promise.all([fetch(`${API}/api/students`, { headers }), fetch(`${API}/api/staff`, { headers })])
        if(!sRes.ok || !tRes.ok) throw new Error('api fetch failed')
        const s = await sRes.json()
        const t = await tRes.json()
        setStudents(s)
        setStaff(t)
      }catch(err){
        console.warn('Server fetch failed, using local storage', err)
        // already initialized from localStorage
      }
    })()
  }, [token])

  // Add student: send multipart to server if available, otherwise fallback to local implementation
  const addStudent = async (data, onProgress) => {
    try{
      // Build form data for file + fields
      const fd = new FormData()
      fd.append('name', data.name || '')
      fd.append('roll', data.roll || '')
      fd.append('dob', data.dob || '')
      fd.append('admissionFees', data.admissionFees || 0)
      fd.append('monthlyFees', data.monthlyFees || 0)
      if(data.bForm && data.bForm instanceof File) fd.append('bForm', data.bForm)

      const res = await fetch(`${API}/api/students`, { method: 'POST', body: fd })
      if(!res.ok) throw new Error('server add failed')
      const student = await res.json()
      setStudents(prev => [...prev, student])
      return student
    }catch(err){
      // Fallback to local storage approach (offline)
      console.warn('addStudent server failed, using local fallback', err)
      const id = uuidv4()
      if(data.bForm && data.bForm instanceof File){
        const url = await uploadFile(`students/${id}/${data.bForm.name}`, data.bForm, onProgress)
        data.bForm = url
      }
      const admission = Number(data.admissionFees || 0)
      const monthly = Number(data.monthlyFees || 0)
      const totalFees = admission + monthly * 12
      const payments = {}
      MONTHS.forEach(m => { payments[m] = data.payments?.[m] || '' })
      const paid = Number(data.paid || 0)
      const paidFromMonths = MONTHS.filter(m => (payments[m] || '').toString().toLowerCase() === 'p').length * monthly
      const unpaid = Math.max(0, totalFees - (paidFromMonths + paid))
      const roll = data.roll ? data.roll.toString() : (students.length + 1).toString().padStart(2,'0')
      const student = { id, roll, admissionFees: admission, monthlyFees: monthly, totalFees, payments, paid, unpaid, ...data }
      setStudents(prev => {
        const arr = [...prev, student]
        try{ localStorage.setItem('students', JSON.stringify(arr)) }catch(e){ }
        return arr
      })
      return student
    }
  }

  // delete a student
  const deleteStudent = async (id) => {
    try{
      const res = await fetch(`${API}/api/students/${id}`, { method: 'DELETE' })
      if(!res.ok) throw new Error('delete failed')
      setStudents(prev => prev.filter(s => s.id !== id))
      return true
    }catch(err){
      console.warn('delete student failed, falling back to local', err)
      setStudents(prev => {
        const arr = prev.filter(s => s.id !== id)
        try{ localStorage.setItem('students', JSON.stringify(arr)) }catch(e){ }
        return arr
      })
      return true
    }
  }

  // login/logout
  const login = async (username, password) => {
    try{
      const res = await fetch(`${API}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) })
      if(!res.ok){ const body = await res.json().catch(()=>({})); throw new Error(body.error || 'login failed') }
      const { token } = await res.json()
      setToken(token)
      localStorage.setItem('token', token)
      // fetch current user
      const meRes = await fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      if(!meRes.ok) throw new Error('failed to fetch user')
      const u = await meRes.json()
      setUser(u)
      localStorage.setItem('user', JSON.stringify(u))
      return u
    }catch(err){ throw err }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const addStaff = async (data, onProgress) => {
    try{
      const fd = new FormData()
      fd.append('name', data.name || '')
      fd.append('role', data.role || '')
      if(data.cnic && data.cnic instanceof File) fd.append('cnic', data.cnic)

      const res = await fetch(`${API}/api/staff`, { method: 'POST', body: fd })
      if(!res.ok) throw new Error('server add failed')
      const s = await res.json()
      setStaff(prev => [...prev, s])
      return s
    }catch(err){
      console.warn('addStaff server failed, using local fallback', err)
      const id = uuidv4()
      if(data.cnic && data.cnic instanceof File){
        const url = await uploadFile(`staff/${id}/${data.cnic.name}`, data.cnic, onProgress)
        data.cnic = url
      }
      const s = { id, ...data }
      setStaff(prev => {
        const arr = [...prev, s]
        try{ localStorage.setItem('staff', JSON.stringify(arr)) }catch(e){ }
        return arr
      })
      return s
    }
  }

  const updateStudent = async (id, patch) => {
    try{
      const res = await fetch(`${API}/api/students/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch) })
      if(!res.ok) throw new Error('update failed')
      const s = await res.json()
      setStudents(prev => prev.map(x => x.id === id ? s : x))
    }catch(err){
      // fallback locally
      setStudents(prev => {
        const arr = prev.map(s => s.id !== id ? s : ({ ...s, ...patch }))
        try{ localStorage.setItem('students', JSON.stringify(arr)) }catch(e){ }
        return arr
      })
    }
  }

  const updateStaff = async (id, patch) => {
    try{
      const res = await fetch(`${API}/api/staff/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch) })
      if(!res.ok) throw new Error('update failed')
      const s = await res.json()
      setStaff(prev => prev.map(x => x.id === id ? s : x))
    }catch(err){
      setStaff(prev => {
        const arr = prev.map(s => s.id === id ? ({ ...s, ...patch }) : s)
        try{ localStorage.setItem('staff', JSON.stringify(arr)) }catch(e){ }
        return arr
      })
    }
  }

  const deleteStaff = async (id) => {
    try{
      const res = await fetch(`${API}/api/staff/${id}`, { method: 'DELETE' })
      if(!res.ok) throw new Error('delete failed')
      setStaff(prev => prev.filter(s => s.id !== id))
      return true
    }catch(err){
      console.warn('delete staff failed, falling back to local', err)
      setStaff(prev => {
        const arr = prev.filter(s => s.id !== id)
        try{ localStorage.setItem('staff', JSON.stringify(arr)) }catch(e){ }
        return arr
      })
      return true
    }
  }

  const value = { students, staff, addStudent, addStaff, updateStudent, updateStaff, deleteStudent, deleteStaff, login, logout, user, token, setStudents, setStaff }

  return React.createElement(StoreContext.Provider, { value }, children)
}

export function useStore(){
  return useContext(StoreContext)
} 
