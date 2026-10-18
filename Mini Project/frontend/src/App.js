
import React, { useState, useEffect } from "react";
import "./App.css";

const API = "http://localhost:5000";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [page, setPage] = useState("login");
  const [form, setForm] = useState({});
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const change = e => setForm({ ...form, [e.target.name]: e.target.value });

  const call = async (url, method = "GET", data) => {
    const r = await fetch(API + url, {
      method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: data ? JSON.stringify(data) : undefined
    });
    const d = await r.json();
    if (!r.ok) throw Error(d.message || "Error");
    return d;
  };

  const load = () => call("/items").then(setItems);

  useEffect(() => {
    if (token) load();
  }, [token]);

  const submit = async e => {
    e.preventDefault();
    try {
      if (!token) {
        const d = await call("/" + page, "POST", form);
        localStorage.setItem("token", d.token);
        setToken(d.token);
      } else {
        await call("/items", "POST", form);
        setForm({});
        e.target.reset();
        load();
      }
    } catch (e) { alert(e.message); }
  };

  return (
    <main className="container">
      <h1>CampusFind</h1>
      {!token ? <>
        <form onSubmit={submit}>
          {page === "signup" && <input name="name" placeholder="Name" onChange={change} required />}
          <input name="email" type="email" placeholder="Email" onChange={change} required />
          <input name="password" type="password" placeholder="Password" onChange={change} required />
          <button>{page}</button>
        </form>
        <button onClick={() => setPage(page === "login" ? "signup" : "login")}>Switch Page</button>
      </> : <>
        <button onClick={() => {
          localStorage.removeItem("token");
          setToken("");
        }}>Logout</button>
        <form onSubmit={submit}>
          <input name="title" placeholder="Item Name" onChange={change} required />
          <input name="description" placeholder="Description" onChange={change} required />
          <input name="location" placeholder="Location" onChange={change} required />
          <select name="type" onChange={change}><option>Lost</option><option>Found</option></select>
          <button>Add Report</button>
        </form>
        <input placeholder="Search" value={search} onChange={e => setSearch(e.target.value)} />
        <select value={filter} onChange={e => setFilter(e.target.value)}>
          <option>All</option><option>Lost</option><option>Found</option>
        </select>
        {items.filter(i => (filter === "All" || i.type === filter) &&
          (i.title + i.description).toLowerCase().includes(search.toLowerCase()))
          .map(i => <article className="item-card" key={i._id}>
            <h3>{i.title} - {i.type}</h3>
            <p>{i.description}</p><p>{i.location}</p>
            <button onClick={async () => {
              try { await call(`/items/${i._id}`, "DELETE"); load(); }
              catch (e) { alert(e.message); }
            }}>Delete</button>
          </article>)}
      </>}
    </main>
  );
}
