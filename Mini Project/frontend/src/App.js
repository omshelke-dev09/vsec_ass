
import React, { useEffect, useState } from "react";
import "./App.css";

const API = "http://localhost:5000";

export default function App() {
  const [token, setToken] = useState(
    localStorage.getItem("token") || ""
  );
  const [page, setPage] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("Lost");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function request(path, method = "GET", data) {
    let response;

    try {
      response = await fetch(`${API}${path}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token
            ? { Authorization: `Bearer ${token}` }
            : {})
        },
        ...(data ? { body: JSON.stringify(data) } : {})
      });
    } catch {
      throw new Error(
        "Cannot connect to the backend. Make sure server.js is running on port 5000."
      );
    }

    const text = await response.text();
    let result;

    try {
      result = JSON.parse(text);
    } catch {
      throw new Error(
        `Backend returned a non-JSON response (${response.status}). Check the backend routes in server.js.`
      );
    }

    if (!response.ok) {
      throw new Error(
        result.message || `Request failed (${response.status})`
      );
    }

    return result;
  }

  useEffect(() => {
    if (!token) return;

    async function loadItems() {
      try {
        const data = await request("/items");
        setItems(Array.isArray(data) ? data : []);
      } catch (error) {
        setMessage(error.message);
      }
    }

    loadItems();
    // Load reports when the login token changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const endpoint =
        page === "signup" ? "/signup" : "/login";

      const data = await request(endpoint, "POST", {
        name,
        email,
        password
      });

      if (!data.token) {
        throw new Error(
          "The backend did not return a login token. Check server.js."
        );
      }

      localStorage.setItem("token", data.token);
      setToken(data.token);
      setPage("home");
      setPassword("");
      setMessage("Welcome to CampusFind!");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function addItem(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const item = await request("/items", "POST", {
        title,
        description,
        location,
        type
      });

      setItems((previous) => [item, ...previous]);
      setTitle("");
      setDescription("");
      setLocation("");
      setMessage("Report added successfully!");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function deleteItem(id) {
    if (!window.confirm("Are you sure you want to delete this report?")) {
      return;
    }

    try {
      await request(`/items/${id}`, "DELETE");
      setItems((previous) =>
        previous.filter((item) => item._id !== id)
      );
      setMessage("Report deleted successfully.");
    } catch (error) {
      setMessage(error.message);
    }
  }

  function logout() {
    localStorage.removeItem("token");
    setToken("");
    setItems([]);
    setPage("login");
    setName("");
    setEmail("");
    setPassword("");
    setMessage("");
  }

  function getUserId() {
    try {
      const payload = token.split(".")[1]
        .replace(/-/g, "+")
        .replace(/_/g, "/");

      return JSON.parse(
        atob(payload + "=".repeat((4 - payload.length % 4) % 4))
      ).id;
    } catch {
      return "";
    }
  }

  if (!token) {
    return (
      <main className="container">
        <h1>CampusFind</h1>
        <p>Lost something? Found something? Let's reconnect it.</p>

        <h2>
          {page === "signup" ? "Create Account" : "Student Login"}
        </h2>

        <form onSubmit={submit}>
          {page === "signup" && (
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />

          <button type="submit" disabled={loading}>
            {loading
              ? "Please wait..."
              : page === "signup"
              ? "Sign Up"
              : "Login"}
          </button>
        </form>

        {message && <p role="alert">{message}</p>}

        <button
          type="button"
          onClick={() => {
            setPage(page === "signup" ? "login" : "signup");
            setMessage("");
          }}
        >
          {page === "signup" ? "Go to Login" : "Create an Account"}
        </button>
      </main>
    );
  }

  const userId = getUserId();

  return (
    <main className="container">
      <header>
        <h1>CampusFind</h1>
        <p>Lost something? Found something? Let's reconnect it.</p>
        <button type="button" onClick={logout}>
          Logout
        </button>
      </header>

      <h2>Report a Lost or Found Item</h2>

      <form onSubmit={addItem}>
        <input
          placeholder="Item Name"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <input
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <input
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="Lost">Lost</option>
          <option value="Found">Found</option>
        </select>

        <button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Add Report"}
        </button>
      </form>

      {message && <p role="alert">{message}</p>}

      <h2>Recent Reports</h2>

      {items.length === 0 ? (
        <p>No reports yet. Be the first to add one!</p>
      ) : (
        items.map((item) => (
          <article className="item-card" key={item._id}>
            <h3>
              {item.title} — {item.type}
            </h3>

            <p>{item.description}</p>
            <p>Location: {item.location}</p>

            {String(item.userId?._id || item.userId) === userId && (
              <button
                type="button"
                onClick={() => deleteItem(item._id)}
              >
                Delete
              </button>
            )}
          </article>
        ))
      )}
    </main>
  );
}
