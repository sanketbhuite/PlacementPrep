import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Chatbot from "../components/Chatbot";
const API_URL = "http://localhost:8081/api";

export default function Home() {
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/announcements`)
      .then((res) => res.json())
      .then(setAnnouncements)
      .catch((err) => console.error("Error loading announcements:", err));
  }, []);

  return (
    <div className="container my-5 text-center">
      <div className="p-4 rounded shadow-sm bg-lights mb-4">
        <h2 className="fw-bold mb-2 text-primary">Placement Preparation Portal</h2>
        <p className="text-muted mb-4">
          Practice coding, improve aptitude, and prepare for your dream job!
        </p>

        <div className="d-flex justify-content-center gap-3 mb-4">
          <Link to="/practice" className="btn btn-outline-primary btn-lg px-4">
            Practice MCQs
          </Link>
          <Link to="/mock" className="btn btn-primary btn-lg px-4">
            Start Mock Test
          </Link>
        </div>

        <p className="text-secondary small">
          Track your progress and improve your weak areas every day.
        </p>
      </div>
      <Chatbot />

      {/* Announcements */}
      <div className="card shadow-sm mx-auto" style={{ maxWidth: 700, backgroundColor: '#fff8f071' }}>
        <div className="card-body text-start">
          <h5 className="mb-3">📢 Announcements</h5>
          {announcements.length === 0 ? ( 
            <p className="text-muted">No announcements yet.</p>
          ) : (
            announcements.map((a, i) => (
              <div key={i} className="announcement-item mb-3 border-bottom pb-2">
                <h6 className="fw-bold text-primary mb-1">{a.title}</h6>
                <p className="mb-1">{a.message}</p>
                <small className="text-muted">{a.date}</small>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
