
import { useEffect, useState } from "react";
import "./App.css";

const API = "http://localhost:5000/api/items";

function App() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [type, setType] = useState("Lost");
  const [category, setCategory] = useState("Stationery");
  const [location, setLocation] = useState("");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  // Fetch reports from the backend
  async function loadItems() {
    try {
      const response = await fetch(API);
      const data = await response.json();
      setItems(data);
    } catch {
      setMessage("Cannot connect to the server.");
    }
  }

  useEffect(() => {
    loadItems();
  }, []);

  // Submit a new report
  async function handleSubmit(event) {
    event.preventDefault();

    try {
      const response = await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          type,
          category,
          location
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Could not add item.");
        return;
      }

      setName("");
      setType("Lost");
      setCategory("Stationery");
      setLocation("");
      setMessage("Report added successfully!");

      loadItems();
    } catch {
      setMessage("Cannot connect to the server.");
    }
  }

  // Delete a report
  async function deleteItem(id) {
    try {
      const response = await fetch(`${API}/${id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        setMessage("Could not delete report.");
        return;
      }

      setMessage("Report deleted.");
      loadItems();
    } catch {
      setMessage("Cannot connect to the server.");
    }
  }

  // Search items by name or location
  const filteredItems = items.filter((item) =>
    `${item.name} ${item.location} ${item.category}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="app">
      <header className="header">
        <div className="brand">Campus<span>Care</span></div>
        <p>Lost something? Found something? Help it find its way home.</p>
      </header>

      <main className="container">
        <section className="intro">
          <p className="eyebrow">YOUR CAMPUS, CONNECTED</p>
          <h1>Lost & Found</h1>
          <p>
            A simple place for students to report and find
            belongings around college.
          </p>
        </section>

        <section className="form-card">
          <h2>Report an Item</h2>
          <p className="muted">Tell other students what happened.</p>

          <form onSubmit={handleSubmit}>
            <label>Item Name</label>
            <input
              type="text"
              placeholder="e.g. Blue water bottle"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <label>Report Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="Lost">I lost something</option>
              <option value="Found">I found something</option>
            </select>

            <label>Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option>Stationery</option>
              <option>Electronics</option>
              <option>Identity Card</option>
              <option>Water Bottle</option>
              <option>Keys</option>
              <option>Other</option>
            </select>

            <label>Location</label>
            <input
              type="text"
              placeholder="e.g. Library, Block C"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />

            <button type="submit">Submit Report</button>
          </form>

          {message && <p className="message">{message}</p>}
        </section>

        <section className="reports">
          <div className="reports-heading">
            <div>
              <h2>Recent Reports</h2>
              <p className="muted">
                {filteredItems.length} item(s) listed
              </p>
            </div>
            <input
              className="search"
              type="text"
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="item-grid">
            {filteredItems.map((item) => (
              <article className="item-card" key={item.id}>
                <span className={
                  item.type === "Lost" ? "tag lost" : "tag found"
                }>
                  {item.type}
                </span>

                <h3>{item.name}</h3>
                <p>Category: {item.category}</p>
                <p>Location: {item.location}</p>
                <p className="date">Reported: {item.date}</p>

                <button
                  className="delete-button"
                  onClick={() => deleteItem(item.id)}
                >
                  Delete Report
                </button>
              </article>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="empty">
              <h3>No reports found</h3>
              <p>Try another search or add a new report.</p>
            </div>
          )}
        </section>
      </main>

      <footer>
        Made for students, by students.
      </footer>
    </div>
  );
}

export default App;
