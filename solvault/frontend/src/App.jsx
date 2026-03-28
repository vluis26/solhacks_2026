import { useEffect, useState } from "react";
import api from "./api";

export default function App() {
  const [health, setHealth] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .get("/health")
      .then((res) => setHealth(res.data))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div>
      <h1>My App</h1>
      <h2>Backend health check</h2>
      {health && <pre>{JSON.stringify(health, null, 2)}</pre>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      {!health && !error && <p>Loading...</p>}
    </div>
  );
}
