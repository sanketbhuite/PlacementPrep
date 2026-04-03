import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  ResponsiveContainer,
} from "recharts";

const cardStyle = (delay = 0) => ({
  animation: `fadeUp 0.6s ease forwards`,
  animationDelay: `${delay}s`,
  opacity: 0,
});

function useCountUp(value, duration = 600) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    if (value === null || value === undefined) return;

    const stepTime = Math.max(10, duration / Math.max(value, 1));

    const interval = setInterval(() => {
      start += 1;
      if (start >= value) {
        setCount(value);
        clearInterval(interval);
      } else {
        setCount(start);
      }
    }, stepTime);

    return () => clearInterval(interval);
  }, [value, duration]);

  return count;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState("line");
  const totalAttempts = useCountUp(summary?.totalAttempts || 0);
  const bestScore = useCountUp(summary?.bestScore || 0);
  const averageScore = useCountUp(summary?.averageScore || 0);
  const latestScore = useCountUp(summary?.latestScore || 0);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      fetch(`http://localhost:8081/api/scores/summary/${user.id}`).then((r) =>
        r.json()
      ),
      fetch(`http://localhost:8081/api/scores/user/${user.id}`).then((r) =>
        r.json()
      ),
    ])
      .then(([summaryData, scoreData]) => {
        setSummary(summaryData);
        setScores(
          scoreData.map((s, i) => ({
            name: `Attempt ${i + 1}`,
            score: s.score,
            testType: s.testType || "Mock Test",
            date: new Date(s.createdAt).toLocaleDateString(),
          }))
        );
      })
      .catch((err) => console.error("Failed to load dashboard data:", err))
      .finally(() => setLoading(false));
  }, [user]);

  const getMotivation = () => {
    if (!summary) return "";
    if (summary.bestScore >= 80) return "Outstanding progress! Keep aiming high 🚀";
    if (summary.averageScore >= 50) return "You’re improving steadily — stay consistent!";
    return "Every expert was once a beginner. Keep going 💪";
  };

  if (loading)
    return (
      <div className="text-center my-5">
        <p>Loading your dashboard...</p>
      </div>
    );

  return (
    <div className="container my-5" style={{ maxWidth: "900px" }}>
      <h3 className="mb-4 fw-bold text-primary text-center">
        Welcome, {user?.name || "Learner"}!
      </h3>
<style>
{`
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
`}
</style>
      {/* ===== SUMMARY CARDS ===== */}
      <div className="row g-4 mb-4">
  <div className="col-md-3 col-6">
    <div className="card border-0 shadow rounded-4 text-center p-3 h-100" style={cardStyle(0.1)}>
      <h6 className="text-muted">Total Attempts</h6>
      <p className="fs-3 fw-bold text-primary mb-0">
        {totalAttempts}
      </p>
    </div>
  </div>

  <div className="col-md-3 col-6">
    <div className="card border-0 shadow rounded-4 text-center p-3 h-100" style={cardStyle(0.2)}>
      <h6 className="text-muted">Best Score</h6>
      <p className="fs-3 fw-bold text-success mb-0">
        {bestScore}%
      </p>
    </div>
  </div>

  <div className="col-md-3 col-6">
    <div className="card border-0 shadow rounded-4 text-center p-3 h-100" style={cardStyle(0.3)}>
      <h6 className="text-muted">Average Score</h6>
      <p className="fs-3 fw-bold text-primary mb-0">
        {averageScore}%
      </p>
    </div>
  </div>

  <div className="col-md-3 col-6">
    <div className="card border-0 shadow rounded-4 text-center p-3 h-100" style={cardStyle(0.4)}>
      <h6 className="text-muted">Latest Score</h6>
      <p className="fs-3 fw-bold text-warning mb-0">
        {latestScore}%
      </p>
    </div>
  </div>
</div>

      
      <div
  className="alert text-center shadow-sm rounded-4"
  style={{
    backgroundColor: "#eadbc8",
    color: "#4b2e2b",
    border: "none"
  }}
>
  {getMotivation()}
</div>


      {/* ===== CHART SECTION ===== */}
      <div className="card border-0 shadow rounded-4 p-4 mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold mb-0" style={{ color: "#4b2e2b" }}>📊 Performance Overview</h5>

          <div className="btn-group btn-group-sm mb-3" role="group">
            <button
              className={`btn btn-sm ${
                chartType === "line" ? "btn-primary" : "btn-outline-primary"
              }`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setChartType("line")}
            >
              Line Chart
            </button>
            <button
              className={`btn btn-sm ${
                chartType === "bar" ? "btn-primary" : "btn-outline-primary"
              }`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setChartType("bar")}
            >
              Bar Chart
            </button>

          </div>
        </div>

        {scores.length === 0 ? (
          <p className="text-center text-muted">
            No test attempts yet. Take a mock test to see your progress!
          </p>
        ) : (
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer width="100%" height="100%" aspect={3} >
              {chartType === "line" ? (
                <LineChart data={scores}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                 <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#6f4e37"
                    strokeWidth={3}
                    dot={{ r: 5, fill: "#6f4e37" }}
                  />

                </LineChart>
              ) : (
                <BarChart data={scores}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                 <Bar
                    dataKey="score"
                    fill="#a07855"
                    barSize={40}
                  />

                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
