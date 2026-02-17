import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/test")
      .then((res) => setMessage(res.data.message))
      .catch((err) => setMessage("Connection Failed"));
  }, []);

  return (
    <div>
      <h1>Forge Project</h1>
      <p>Backend Status: {message}</p>
    </div>
  );
}

export default App;
