// import React, { useState } from 'react'
// import { useStore } from '../store/useStore'
// import { useNavigate } from 'react-router-dom'
// import './Pages.css'

// export default function Login(){
//   const { login } = useStore()
//   const [username, setUsername] = useState('')
//   const [password, setPassword] = useState('')
//   const [error, setError] = useState(null)
//   const [loading, setLoading] = useState(false)
//   const nav = useNavigate()

//   async function submit(e){
//     e.preventDefault()
//     setLoading(true)
//     setError(null)
//     try{
//       await login(username, password)
//       nav('/')
//     }catch(err){
//       setError(err?.message || 'Login failed')
//     }finally{ setLoading(false) }
//   }

//   return (
//     <div className="page-container">
//       <h2>Login</h2>
//       <form onSubmit={submit} style={{maxWidth:400}}>
//         <div className="field">
//           <input name="username" placeholder="Username" value={username} onChange={(e)=>setUsername(e.target.value)} />
//         </div>
//         <div className="field">
//           <input name="password" type="password" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} />
//         </div>
//         {error && <div style={{color:'red',marginBottom:8}}>{error}</div>}
//         <div className="modal-actions">
//           <button type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
//         </div>
//         <p style={{fontSize:12,color:'#666',marginTop:8}}>Use username: <strong>rehan</strong> and code: <strong>123</strong></p>
//       </form>
//     </div>
//   )
// }




import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // Make sure to create this file

export default function Login() {
  const { login } = useStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(username, password);
      nav('/');
    } catch (err) {
      setError(err?.message || 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <h1>Login</h1>
        
        <form onSubmit={submit}>
          <div className="input-group">
            <input 
              type="text" 
              placeholder="School ID" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required
            />
          </div>

          <div className="input-group">
            <input 
              type="password" 
              placeholder="Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required
            />
            <div className="forgot-password">
              <a href="#forgot">forgot Password?</a>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div className="contact-link">
          <span>Can't find your School ID? </span>
          <a href="#contact">Contact US</a>
        </div>

        <div className="social-icons">
          <div className="icon-circle">f</div>
          <div className="icon-circle">ig</div>
          <div className="icon-circle">t</div>
        </div>
      </div>
    </div>
  );
}