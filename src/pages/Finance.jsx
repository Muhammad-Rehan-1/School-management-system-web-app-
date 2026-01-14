import React from 'react'
import { useStore } from '../store/useStore'
import jsPDF from 'jspdf'
import './Pages.css'  

export default function Finance(){
  const { students, updateStudent } = useStore()
  const [selected, setSelected] = React.useState('All')
  const [selectedIds, setSelectedIds] = React.useState(new Set())
  const [moveTo, setMoveTo] = React.useState('')
  const [query, setQuery] = React.useState('')





  const classes = ['Play Group','Nursery','Prep','One','Two','Three','Four','Five','Six','Seven','Eight','Nine']
  const MONTH_KEYS = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec']
  const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const [asOfMonth, setAsOfMonth] = React.useState(new Date().getMonth())

  const filtered = React.useMemo(() => {
    if (selected === 'All') return students
    return students.filter(s => s.classGrade === selected)
  }, [students, selected])

  const displayed = React.useMemo(() => {
    const base = filtered
    const q = (query || '').trim().toLowerCase()
    if(!q) return base
    const matches = s => (s.name||'').toLowerCase().includes(q) || (s.roll||'').toLowerCase().includes(q) || (s.contact||'').toLowerCase().includes(q)
    return base.filter(matches)
  }, [filtered, query])

  function toggleSelect(id){
    setSelectedIds(prev => {
      const s = new Set(prev)
      if (s.has(id)) s.delete(id)
      else s.add(id)
      return s
    })
  }

  function moveSelected(){
    if(!moveTo) return
    Array.from(selectedIds).forEach(id => updateStudent(id, { classGrade: moveTo }))
    setSelectedIds(new Set())
    setMoveTo('')
  }

  function showDefaulters(){
    const defaulters = students.filter(s => {
      const monthsUpTo = MONTH_KEYS.slice(0, asOfMonth + 1)
      const numPaidMonths = monthsUpTo.filter(m => (s.payments?.[m] || '').toString().toLowerCase() === 'p').length
      const paidFromMonths = (s.monthlyFees || 0) * numPaidMonths
      const totalPaid = paidFromMonths + Number(s.paid || 0)
      const totalDueAsOf = (s.admissionFees || 0) + (s.monthlyFees || 0) * (asOfMonth + 1)
      const unpaidAsOf = Math.max(0, totalDueAsOf - totalPaid)
      return unpaidAsOf > 0
    })
    const doc = new jsPDF()
    doc.setFontSize(14)
    doc.text('Defaulters List', 14, 20)
    let y = 30
    defaulters.forEach(d => {
      const monthsUpTo = MONTH_KEYS.slice(0, asOfMonth + 1)
      const numPaidMonths = monthsUpTo.filter(m => (d.payments?.[m] || '').toString().toLowerCase() === 'p').length
      const paidFromMonths = (d.monthlyFees || 0) * numPaidMonths
      const totalPaid = paidFromMonths + Number(d.paid || 0)
      const totalDueAsOf = (d.admissionFees || 0) + (d.monthlyFees || 0) * (asOfMonth + 1)
      const unpaidAsOf = Math.max(0, totalDueAsOf - totalPaid)
      doc.text(`${d.name} | ${d.roll} | Unpaid (as of ${MONTH_LABELS[asOfMonth]}): ${unpaidAsOf}`, 14, y)
      y += 8
    })
    doc.save('defaulters.pdf')
  }

  return (
    <div className="page-container">
      <h2>Finance</h2>

      <div className="search-row center">
        <div className="search-box">
          <span className="search-icon" aria-hidden>🔍</span>
          <input className="search-input" placeholder="Search by name, roll or contact..." value={query} onChange={(e)=>setQuery(e.target.value)} />
          {query && <button type="button" className="search-clear" onClick={() => setQuery('')} aria-label="Clear search">✕</button>}
        </div>
      </div>

      <div className="classes-row">
        {classes.map(c => (
          <button key={c} className={c===selected? 'active':''} onClick={() => setSelected(c)}>{c}</button>
        ))}
        <button onClick={() => setSelected('All')}>All</button>
      </div>

      <div className="finance-actions" style={{display:'flex',gap:12,alignItems:'center'}}>
        <button onClick={showDefaulters} className="danger">Defaulters</button>
        <div style={{marginLeft:'auto',display:'flex',gap:8,alignItems:'center'}}>
          <select value={asOfMonth} onChange={(e)=>setAsOfMonth(Number(e.target.value))}>
            {MONTH_LABELS.map((m,i) => <option key={m} value={i}>As of {m}</option>)}
          </select>
          <select value={moveTo} onChange={(e)=>setMoveTo(e.target.value)}>
            <option value="">Move selected to...</option>
            {classes.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button onClick={moveSelected}>Move</button>
        </div>
      </div>

      <div className="finance-note">Note: <strong>Total Paid (as of {MONTH_LABELS[asOfMonth]})</strong> = <em>monthly fee × number of months marked "p" up to {MONTH_LABELS[asOfMonth]}</em> + any manual paid amount. <span className="info" title={`Total Paid (as of ${MONTH_LABELS[asOfMonth]}) = monthly fee × number of months marked 'p' up to ${MONTH_LABELS[asOfMonth]} + manual paid amount`}>ℹ️</span></div>

      <table className="table">
        <thead>
          <tr>
            <th></th>
            <th>Name</th>
            <th>Roll</th>
            <th>Class</th>
            <th>Monthly Fee</th>
            <th style={{textAlign:'center'}}>Jan</th>
            <th style={{textAlign:'center'}}>Feb</th>
            <th style={{textAlign:'center'}}>Mar</th>
            <th style={{textAlign:'center'}}>Apr</th>
            <th style={{textAlign:'center'}}>May</th>
            <th style={{textAlign:'center'}}>Jun</th>
            <th style={{textAlign:'center'}}>Jul</th>
            <th style={{textAlign:'center'}}>Aug</th>
            <th style={{textAlign:'center'}}>Sep</th>
            <th style={{textAlign:'center'}}>Oct</th>
            <th style={{textAlign:'center'}}>Nov</th>
            <th style={{textAlign:'center'}}>Dec</th>
            <th>Total Paid</th>
            <th>Unpaid</th>
          </tr>
        </thead>
        <tbody>
          {displayed.map(s => {
            const months = MONTH_KEYS
            const monthsUpTo = MONTH_KEYS.slice(0, asOfMonth + 1)
            const numPaidMonths = monthsUpTo.filter(m => (s.payments?.[m] || '').toString().toLowerCase() === 'p').length
            const paidFromMonths = (s.monthlyFees || 0) * numPaidMonths
            const totalPaid = (Number(s.paid || 0) + paidFromMonths)
            const totalDueAsOf = (s.admissionFees || 0) + (s.monthlyFees || 0) * (asOfMonth + 1)
            const unpaidAsOf = Math.max(0, totalDueAsOf - totalPaid)
            return (
            <tr key={s.id}>
              <td><input type="checkbox" checked={selectedIds.has(s.id)} onChange={() => toggleSelect(s.id)} /></td>
              <td>{s.name}</td>
              <td>{s.roll}</td>
              <td>
                <div className="class-box">{s.classGrade || '-'}</div>
              </td>
              <td>{s.monthlyFees}</td>
              {months.map(m => (
                <td key={m} style={{textAlign:'center'}}>
                  <input className="month-input" value={s.payments?.[m]||''} onChange={(e)=>updateStudent(s.id,{payments:{...(s.payments||{}),[m]: e.target.value}})} />
                </td>
              ))}
              <td>{totalPaid}</td>
              <td>{unpaidAsOf}</td>
            </tr>
          )})}
        </tbody>
      </table>
    </div>
  )
}
