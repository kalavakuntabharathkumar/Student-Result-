import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const API = 'http://localhost:5000/api';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!token) return;
    const url = role === 'admin' ? `${API}/analytics/trends` : `${API}/results/me`;
    axios.get(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setData(res.data))
      .catch(() => {});
  }, [token, role]);

  const login = async () => {
    const res = await axios.post(`${API}/login`, { email, password });
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('role', res.data.role);
    setToken(res.data.token);
    setRole(res.data.role);
  };

  const logout = () => {
    localStorage.clear();
    setToken(null);
    setRole(null);
  };

  if (!token) {
    return (
      <div style={{ maxWidth: 360, margin: '80px auto', fontFamily: 'sans-serif' }}>
        <h2>Student Dashboard Login</h2>
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={{ display: 'block', width: '100%', marginBottom: 8 }} />
        <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ display: 'block', width: '100%', marginBottom: 8 }} />
        <button onClick={login}>Login</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h2>{role === 'admin' ? 'Performance Trends (All Students)' : 'My Results'}</h2>
        <button onClick={logout}>Logout</button>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="semester" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey={role === 'admin' ? 'avg_marks' : 'marks'} stroke="#4f46e5" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
      <table style={{ width: '100%', marginTop: 20, borderCollapse: 'collapse' }}>
        <thead>
          <tr><th>Semester</th><th>Subject</th><th>{role === 'admin' ? 'Avg Marks' : 'Marks'}</th></tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              <td>{row.semester}</td>
              <td>{row.subject}</td>
              <td>{role === 'admin' ? row.avg_marks : row.marks}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
