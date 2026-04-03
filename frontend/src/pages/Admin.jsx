// src/pages/Admin.jsx
import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer
} from "recharts";

const API_ROOT = "http://localhost:8081/api";

const pieColors = ["#6f4e37", "#c4a484"];
const barColor = "#a07855";
const lineColor = "#6f4e37";


export default function Admin() {
  // ---------------------------------------------------
  // 1. ADMIN AUTH (separate from normal user login)
  // ---------------------------------------------------
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError] = useState("");
  const [announcements, setAnnouncements] = useState([]);
const [newAnnouncement, setNewAnnouncement] = useState("");
const [newAnnouncementTitle, setNewAnnouncementTitle] = useState("");

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setAdminError("");

    if (!adminPassword.trim()) {
      setAdminError("Please enter admin password.");
      return;
    }

    try {
      const res = await fetch(`${API_ROOT}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: adminPassword }),
      });

      const data = await res.json();
      if (data.ok) {
        setAdminUnlocked(true);
        setAdminPassword("");
      } else {
        setAdminError("Incorrect admin password.");
      }
    } catch (err) {
      console.error("Admin login error:", err);
      setAdminError("Server error. Try again.");
    }
  };

  const handleAdminLogout = () => {
    // purely front-end lock; we also ping backend for completeness
    fetch(`${API_ROOT}/admin/logout`, { method: "POST" }).catch(() => {});
    setAdminUnlocked(false);
    setAdminPassword("");
  };

  // ---------------------------------------------------
  // 2. DATA STATE
  // ---------------------------------------------------
  const [activeMenu, setActiveMenu] = useState("dashboard");

  const [users, setUsers] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [mockDuration, setMockDuration] = useState({ hours: 0, minutes: 0 });

  // userId -> [ scoreNumber, ... ]
  const [userScoreMap, setUserScoreMap] = useState({});

  const [selectedUser, setSelectedUser] = useState(null);

  const [userSearch, setUserSearch] = useState("");
  const [questionSearch, setQuestionSearch] = useState("");

  // Add-question form state
  const [selectedSubjectForNewQ, setSelectedSubjectForNewQ] = useState(null);
  const [newQ, setNewQ] = useState({
    questionText: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctAnswer: "A",
  });

  // Edit question
  const [editQ, setEditQ] = useState(null);

  // Subjects form
  const [newSubjectName, setNewSubjectName] = useState("");

  // Toast message (simple, Bootstrap-like)
  const [toast, setToast] = useState({ show: false, type: "success", msg: "" });

  const showToast = (type, msg) => {
    setToast({ show: true, type, msg });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 3000);
  };

  // ---------------------------------------------------
  // 3. FETCH CORE DATA ONCE ADMIN IS UNLOCKED
  // ---------------------------------------------------
  useEffect(() => {
    if (!adminUnlocked) return;

    const fetchAll = async () => {
      try {
        const [
  usersRes,
  qRes,
  subjRes,
  durRes,
  annRes
] = await Promise.all([
  fetch(`${API_ROOT}/admin/users`),
  fetch(`${API_ROOT}/questions`),
  fetch(`${API_ROOT}/subjects`),
  fetch(`${API_ROOT}/mock-duration`),
  fetch(`${API_ROOT}/announcements`)
]);

        const [
  usersData,
  qData,
  subjData,
  durData,
  annData
] = await Promise.all([
  usersRes.json(),
  qRes.json(),
  subjRes.json(),
  durRes.json(),
  annRes.json()
]);

setAnnouncements(annData || []);


        setUsers(usersData || []);
        // normalise optionsJson to parsed object for easier use
        const normalisedQuestions = (qData || []).map((q) => ({
          ...q,
          options:
            typeof q.optionsJson === "string"
              ? JSON.parse(q.optionsJson)
              : q.optionsJson || {},
        }));
        setQuestions(normalisedQuestions);
        setSubjects(subjData || []);
        setMockDuration({
          hours: durData.hours || 0,
          minutes: durData.minutes || 0,
        });
      } catch (err) {
        console.error("Error loading admin data:", err);
        showToast("danger", "Failed to load admin data.");
      }
    };

    fetchAll();
  }, [adminUnlocked]);

  // ---------------------------------------------------
  // 4. FETCH SCORES FOR ALL USERS (for view, avg, charts)
  // ---------------------------------------------------
  useEffect(() => {
    if (!adminUnlocked || users.length === 0) return;

    const fetchScores = async () => {
      try {
        const entries = await Promise.all(
          users.map(async (u) => {
            try {
              const res = await fetch(`${API_ROOT}/scores/user/${u.id}`);
              if (!res.ok) return [u.id, []];
              const data = await res.json(); // [{score: 80, ...}, ...]
              const nums = (data || []).map((s) =>
                typeof s.score === "number" ? s.score : Number(s.score) || 0
              );
              return [u.id, nums];
            } catch {
              return [u.id, []];
            }
          })
        );
        setUserScoreMap(Object.fromEntries(entries));
      } catch (err) {
        console.error("Error fetching user scores:", err);
      }
    };

    fetchScores();
  }, [adminUnlocked, users]);

  // ---------------------------------------------------
  // 5. ANALYTICS DERIVED DATA
  // ---------------------------------------------------
  const stats = useMemo(() => {
    const totalUsers = users.length;

    const scoresAll = Object.values(userScoreMap).flat();
    const attemptsByUser = users.map(
      (u) => (userScoreMap[u.id] && userScoreMap[u.id].length) || 0
    );
    const activeUsers = attemptsByUser.filter((a) => a > 0).length;

    const avgScore =
      scoresAll.length > 0
        ? Math.round(
            scoresAll.reduce((sum, s) => sum + (s || 0), 0) / scoresAll.length
          )
        : 0;

    const totalQuestions = questions.length;

    return { totalUsers, activeUsers, avgScore, totalQuestions };
  }, [users, userScoreMap, questions]);

  // Line chart: users over time
  const usersOverTime = useMemo(() => {
    if (!users.length) return [];
    const byDate = {};
    users.forEach((u) => {
      const dateStr = u.createdAt ? u.createdAt.slice(0, 10) : "Unknown";
      byDate[dateStr] = (byDate[dateStr] || 0) + 1;
    });
    const sortedKeys = Object.keys(byDate).sort();
    let cumulative = 0;
    return sortedKeys.map((d) => {
      cumulative += byDate[d];
      return { date: d, total: cumulative };
    });
  }, [users]);

  // Bar chart: questions per subject
  const questionsPerSubject = useMemo(() => {
    if (!questions.length || !subjects.length) return [];
    const map = {};
    subjects.forEach((s) => {
      map[s.name] = 0;
    });
    questions.forEach((q) => {
      const subjName = q.subject?.name || "Other";
      map[subjName] = (map[subjName] || 0) + 1;
    });
    return Object.entries(map).map(([name, count]) => ({ name, count }));
  }, [questions, subjects]);

  // Horizontal bar: top performers
  const topPerformers = useMemo(() => {
    const list = users
      .map((u) => {
        const arr = userScoreMap[u.id] || [];
        if (!arr.length) return null;
        const avg =
          arr.reduce((sum, s) => sum + (s || 0), 0) / (arr.length || 1);
        return { name: u.name, avg: Math.round(avg) };
      })
      .filter(Boolean)
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 5);

    // Recharts vertical bar chart uses X as name, Y as avg.
    return list;
  }, [users, userScoreMap]);

  // ---------------------------------------------------
  // 6. HELPERS
  // ---------------------------------------------------
  const filteredUsers = users.filter((u) => {
    if (!userSearch.trim()) return true;
    const s = userSearch.toLowerCase();
    return (
      u.name?.toLowerCase().includes(s) || u.email?.toLowerCase().includes(s)
    );
  });

  const filteredQuestions = questions.filter((q) => {
    if (!questionSearch.trim()) return true;
    const s = questionSearch.toLowerCase();
    return q.questionText?.toLowerCase().includes(s);
  });

  const getUserAvgScore = (userId) => {
    const arr = userScoreMap[userId] || [];
    if (!arr.length) return "-";
    const avg =
      arr.reduce((sum, s) => sum + (s || 0), 0) / (arr.length || 1);
    return Math.round(avg);
  };

  const getUserAttempts = (userId) =>
    (userScoreMap[userId] && userScoreMap[userId].length) || 0;

  const handleSaveMockDuration = async (e) => {
    e.preventDefault();
    const totalMinutes =
      (Number(mockDuration.hours) || 0) * 60 +
      (Number(mockDuration.minutes) || 0);

    try {
      const res = await fetch(`${API_ROOT}/mock-duration`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ durationMinutes: totalMinutes }),
      });
      if (!res.ok) throw new Error(await res.text());
      showToast("success", "Mock test duration updated.");
    } catch (err) {
      console.error("Mock duration save error:", err);
      showToast("danger", "Failed to update mock test duration.");
    }
  };
const handleAddAnnouncement = async (e) => {
  e.preventDefault();
  if (!newAnnouncement.trim()) {
    showToast("warning", "Announcement cannot be empty.");
    return;
  }

  try {
    const res = await fetch(`${API_ROOT}/announcements`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
  title: newAnnouncementTitle.trim(),
  message: newAnnouncement.trim(),
}),
    });

    if (!res.ok) throw new Error(await res.text());
    const saved = await res.json();

    setAnnouncements((prev) => [saved, ...prev]);
    setNewAnnouncement("");
    showToast("success", "Announcement posted.");
  } catch (err) {
    console.error(err);
    showToast("danger", "Failed to post announcement.");
  }
};

const handleDeleteAnnouncement = async (id) => {
  if (!window.confirm("Delete this announcement?")) return;

  try {
    const res = await fetch(`${API_ROOT}/announcements/${id}`, {
      method: "DELETE",
    });
    if (!res.ok && res.status !== 204) throw new Error();

    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    showToast("success", "Announcement deleted.");
  } catch {
    showToast("danger", "Failed to delete announcement.");
  }
};

  // ---------------------------------------------------
  // 7. QUESTION CRUD
  // ---------------------------------------------------
  const handleAddQuestion = async (e) => {
    e.preventDefault();

    if (!selectedSubjectForNewQ) {
      showToast("warning", "Please select a subject for this question.");
      return;
    }
    if (!newQ.questionText.trim()) {
      showToast("warning", "Question text is required.");
      return;
    }

    const optionsJson = JSON.stringify({
      A: newQ.optionA,
      B: newQ.optionB,
      C: newQ.optionC,
      D: newQ.optionD,
    });

    try {
      const res = await fetch(`${API_ROOT}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionText: newQ.questionText.trim(),
          optionsJson,
          correctAnswer: newQ.correctAnswer,
          subjectId: selectedSubjectForNewQ.id,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const saved = await res.json();

      setQuestions((prev) => [
        ...prev,
        { ...saved, options: JSON.parse(saved.optionsJson || optionsJson) },
      ]);
      setNewQ({
        questionText: "",
        optionA: "",
        optionB: "",
        optionC: "",
        optionD: "",
        correctAnswer: "A",
      });
      showToast("success", "Question added.");
    } catch (err) {
      console.error("Add question error:", err);
      showToast("danger", "Failed to add question.");
    }
  };

  const handleUpdateQuestion = async (e) => {
    e.preventDefault();
    if (!editQ) return;

    const optionsJson = JSON.stringify(editQ.options || {});
    try {
      const res = await fetch(`${API_ROOT}/questions/${editQ.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionText: editQ.questionText,
          optionsJson,
          correctAnswer: editQ.correctAnswer,
        }),
      });
      if (!res.ok) throw new Error(await res.text());

      setQuestions((prev) =>
        prev.map((q) =>
          q.id === editQ.id ? { ...editQ, options: editQ.options } : q
        )
      );
      setEditQ(null);
      showToast("success", "Question updated.");
    } catch (err) {
      console.error("Update question error:", err);
      showToast("danger", "Failed to update question.");
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm("Delete this question?")) return;
    try {
      const res = await fetch(`${API_ROOT}/questions/${id}`, {
        method: "DELETE",
      });
      if (!res.ok && res.status !== 204) throw new Error(await res.text());
      setQuestions((prev) => prev.filter((q) => q.id !== id));
      showToast("success", "Question deleted.");
    } catch (err) {
      console.error("Delete question error:", err);
      showToast("danger", "Failed to delete question.");
    }
  };

  // ---------------------------------------------------
  // 8. SUBJECTS CRUD
  // ---------------------------------------------------
  const handleAddSubject = async (e) => {
    e.preventDefault();
    if (!newSubjectName.trim()) {
      showToast("warning", "Enter subject name.");
      return;
    }

    try {
      const res = await fetch(`${API_ROOT}/subjects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newSubjectName.trim() }),
      });
      if (!res.ok) throw new Error(await res.text());
      const saved = await res.json();
      setSubjects((prev) => [...prev, saved]);
      setNewSubjectName("");
      showToast("success", "Subject added.");
    } catch (err) {
      console.error("Add subject error:", err);
      showToast("danger", "Failed to add subject.");
    }
  };

  const handleDeleteSubject = async (id) => {
    if (!window.confirm("Delete this subject?")) return;
    try {
      const res = await fetch(`${API_ROOT}/subjects/${id}`, {
        method: "DELETE",
      });
      if (!res.ok && res.status !== 204) throw new Error(await res.text());
      setSubjects((prev) => prev.filter((s) => s.id !== id));
      showToast("success", "Subject deleted.");
    } catch (err) {
      console.error("Delete subject error:", err);
      showToast("danger", "Failed to delete subject.");
    }
  };

  // ---------------------------------------------------
  // 9. ADMIN LOGIN SCREEN (LOCKED)
  // ---------------------------------------------------
  if (!adminUnlocked) {
    return (
      <div className="container my-5" style={{ maxWidth: 420 }}>
        <div
  className="card border-0 shadow rounded-4"
  style={{ backgroundColor: "#fff8f0" }}
>
          <div className="card-body">
            <img src="/src/assets/logo169.png" alt="Logo" style={{ width: 350, marginRight: 8}} />
            <h4 className="mb-3 text-center fw-bold" style={{ color: "#4b2e2b" }}>
  Admin Access
</h4>
            <p className="text-muted text-center">
              Enter admin password to open the panel.
            </p>
            <form onSubmit={handleAdminLogin} className="d-grid gap-3 mt-3">
              <input
                type="password"
                className="form-control"
                placeholder="Admin password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
              />
              {adminError && (
                <div className="alert alert-danger py-2 mb-0">
                  {adminError}
                </div>
              )}
              <button className="btn btn-primary rounded-pill" type="submit">
                Unlock Admin Panel
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------
  // 10. MAIN ADMIN PANEL LAYOUT
  // ---------------------------------------------------
  return (
    <div className="container-fluid">
      {/* Toast */}
      {toast.show && (
        <div
          className={`toast align-items-center text-white bg-${
            toast.type === "danger"
              ? "danger"
              : toast.type === "warning"
              ? "warning"
              : "success"
          } border-0 show position-fixed top-0 end-0 m-3`}
          role="alert"
        >
          <div className="d-flex">
            <div className="toast-body">{toast.msg}</div>
          </div>
        </div>
      )}

      <div className="row">
        {/* Sidebar */}
        <div
          className="col-12 col-md-3 col-lg-2 p-2 p-md-0"
          style={{ backgroundColor: "#4b2e2b", color: "#f7efe5", overflowX: "auto" }}
        >

          <div className="p-3 border-bottom border-secondary">
            <h5 className="mb-0 text-white">☕ PlacementPrep</h5>
          </div>
          <ul className="nav flex-row flex-md-column nav-pills gap-1 p-2">
            {[
  ["dashboard", "Dashboard"],
  ["users", "Users"],
  ["questions", "Questions"],
  ["subjects", "Subjects"],
  ["announcements", "Announcements"], // 🔥 NEW
  ["mock", "Mock Test Settings"],
  ["analytics", "Analytics"],
].map(([key, label]) => (
              <li className="nav-item" key={key}>
                <button
                  className={
                    "nav-link w-100 text-start rounded-3 " +
                  (activeMenu === key ? "btn-primary rounded-pill" : "text-light")
                  }
                  onClick={() => setActiveMenu(key)}
                  style={{ marginBottom: "4px" }}
                >
                  {label}
                </button>
              </li>
            ))}
            <li className="mt-auto nav-item">
              <button
                className="nav-link w-100 text-start btn btn-outline-light mt-3"
                onClick={handleAdminLogout}
              >
                Lock & Logout
              </button>
            </li>
          </ul>
        </div>

        {/* Content */}
        <div className="col-12 col-md-9 col-lg-10 p-4">
          {/* Top cards */}
          <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="mb-0 fw-bold" style={{ color: "#4b2e2b" }} >
            Admin Panel
          </h4>
          </div>

          <div className="row g-3 mb-4">
            {[
              ["Total Users", stats.totalUsers, "primary"],
              ["Active Users", stats.activeUsers, "success"],
              ["Questions", stats.totalQuestions, "info"],
              ["Avg Score", `${stats.avgScore}%`, "warning"],
            ].map(([label, value, color], i) => (
              <div className="col-6 col-md-3" key={i}>
                <div
                  className="card border-0 shadow rounded-4 text-center"
                  style={{ backgroundColor: "#fff8f0", transition: "transform 0.2s ease" }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-4px)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
         >

                  <div className="card-body">
                    <div className="text-muted small">{label}</div>
                    <div className="fs-4 fw-bold" style={{ color: "#6f4e37" }}>
                      {value}
                    </div>

                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Different sections based on activeMenu */}
          {activeMenu === "dashboard" && (
            <div className="row g-4">
              <div className="col-lg-6">
                <div
  className="card border-0 shadow rounded-4"
  style={{ backgroundColor: "#fff8f0",
  transition: "transform 0.2s ease",
}}
onMouseEnter={(e) =>
  (e.currentTarget.style.transform = "translateY(-4px)")
}
onMouseLeave={(e) =>
  (e.currentTarget.style.transform = "translateY(0)")
}

>
                  <div className="card-body">
                    <h5 className="card-title">Users Over Time</h5>
                    {usersOverTime.length ? (
                      <div style={{ width: "100%", height: 260 }}>
  <ResponsiveContainer width="100%" height="100%">
    <LineChart
      data={usersOverTime}
      margin={{ top: 10, right: 20, left: 0, bottom: 30 }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis
  dataKey="date"
  angle={-20}
  textAnchor="end"
  interval={0}
/>

      <YAxis />
      <Tooltip />
      <Legend />
      <Line
        type="monotone"
        dataKey="total"
        stroke={lineColor}
        strokeWidth={2}
      />
    </LineChart>
  </ResponsiveContainer>
</div>
                    ) : (
                      <p className="text-muted mb-0">
                        Not enough data to show trend yet.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="col-lg-6">
                <div
  className="card border-0 shadow rounded-4"
  style={{ backgroundColor: "#fff8f0",
  transition: "transform 0.2s ease",
}}
onMouseEnter={(e) =>
  (e.currentTarget.style.transform = "translateY(-4px)")
}
onMouseLeave={(e) =>
  (e.currentTarget.style.transform = "translateY(0)")
}
>
                  <div className="card-body">
                    <h5 className="card-title">Active vs Inactive Users</h5>
                    <PieChart width={400} height={260}>
                      <Pie
                        data={[
                          { name: "Active", value: stats.activeUsers },
                          {
                            name: "Inactive",
                            value: stats.totalUsers - stats.activeUsers,
                          },
                        ]}
                        dataKey="value"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {pieColors.map((c, i) => (
                          <Cell key={i} fill={c} />
                        ))}
                      </Pie>
                      <Legend />
                    </PieChart>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeMenu === "users" && (
            <>
              <div className="d-flex justify-content-between align-items-center mb-3 flex-column flex-sm-row gap-2">
                <h5>Users</h5>
                <input
                  className="form-control rounded-pill w-auto"
                  placeholder="Search users..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>
              <div className="table-responsive">
                <table className="table table-hover align-middle table-borderless">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Attempts</th>
                      <th>Avg Score</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u, idx) => (
                      <tr key={u.id}>
                        <td>{idx + 1}</td>
                        <td>{u.name}</td>
                        <td>{u.email}</td>
                        <td>{getUserAttempts(u.id)}</td>
                        <td>
                          {getUserAttempts(u.id)
                            ? `${getUserAvgScore(u.id)}%`
                            : "-"}
                        </td>
                        <td>
                            <button
                              className="btn btn-sm btn-outline-primary me-2 rounded-pill"
                              onClick={() => setSelectedUser(u)}
                            >
                              View
                            </button>

                            <button
                              className="btn btn-sm btn-outline-warning me-2 rounded-pill"
                              onClick={() => setEditUser(u)}
                            >
                              Edit
                            </button>

                            <button
                              className="btn btn-sm btn-outline-danger rounded-pill"
                              onClick={() => deleteUser(u.id)}
                            >
                              Delete
                            </button>
                          </td>

                      </tr>
                    ))}
                    {!filteredUsers.length && (
                      <tr>
                        <td colSpan={6} className="text-center text-muted">
                          No users found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* View user modal/card */}
              {selectedUser && (
                <div className="card mt-3 shadow-sm">
                  <div className="card-body">
                    <div className="d-flex flex-column flex-sm-row gap-2">
                      <h6 className="mb-0">
                        User Details – {selectedUser.name}
                      </h6>
                      <button
                        className="btn-close"
                        onClick={() => setSelectedUser(null)}
                      ></button>
                    </div>
                    <hr />
                    <p className="mb-1">
                      <strong>Email:</strong> {selectedUser.email}
                    </p>
                    <p className="mb-1">
                      <strong>Registered:</strong>{" "}
                      {selectedUser.createdAt
                        ? new Date(
                            selectedUser.createdAt
                          ).toLocaleString()
                        : "-"}
                    </p>
                    <p className="mb-2">
                      <strong>Total Attempts:</strong>{" "}
                      {getUserAttempts(selectedUser.id)}
                    </p>
                    <p className="mb-2">
                      <strong>Average Score:</strong>{" "}
                      {getUserAttempts(selectedUser.id)
                        ? `${getUserAvgScore(selectedUser.id)}%`
                        : "-"}
                    </p>
                    <h6 className="mt-3">All Scores</h6>
                    <ul className="mb-0">
                      {(userScoreMap[selectedUser.id] || []).length ? (
                        userScoreMap[selectedUser.id].map((s, i) => (
                          <li key={i}>Attempt {i + 1}: {s}%</li>
                        ))
                      ) : (
                        <li className="text-muted">
                          No scores recorded yet.
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              )}
            </>
          )}

          {activeMenu === "questions" && (
            <>
              <div className="mb-4">
                <h5 className="mb-3">Add New Question</h5>
                <div className="row g-3">
                  <div className="col-lg-3">
                    <div className="card h-100 shadow-sm">
                      <div className="card-body">
                        <h6 className="card-title">Select Subject</h6>
                        <div className="d-flex flex-wrap  gap-2">
                          {subjects.map((s) => (
                            <button
                              key={s.id}
                              type="button"
                              className={
                                "btn btn-sm " +
                                (selectedSubjectForNewQ?.id === s.id
                                  ? "btn-primary rounded-pill"
                                  : "btn-outline-primary rounded-pill")
                              }
                              onClick={() => setSelectedSubjectForNewQ(s)}
                            >
                              {s.name}
                            </button>
                          ))}
                          {!subjects.length && (
                            <span className="text-muted small">
                              No subjects. Add them in Subjects tab.
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-9">
                    <div
  className="card border-0 shadow rounded-4"
  style={{ backgroundColor: "#fff8f0" }}
>
                      <div className="card-body">
                        <form
                          className="row g-3"
                          onSubmit={handleAddQuestion}
                        >
                          <div className="col-12">
                            <textarea
                              className="form-control"
                              rows={2}
                              placeholder="Enter question..."
                              value={newQ.questionText}
                              onChange={(e) =>
                                setNewQ((q) => ({
                                  ...q,
                                  questionText: e.target.value,
                                }))
                              }
                            />
                          </div>
                          {["A", "B", "C", "D"].map((optKey) => (
                            <div className="col-md-6" key={optKey}>
                              <input
                                className="form-control"
                                placeholder={`Option ${optKey}`}
                                value={newQ[`option${optKey}`]}
                                onChange={(e) =>
                                  setNewQ((q) => ({
                                    ...q,
                                    [`option${optKey}`]: e.target.value,
                                  }))
                                }
                              />
                            </div>
                          ))}
                          <div className="col-md-4">
                            <label className="form-label small">
                              Correct Answer
                            </label>
                            <select
                              className="form-select"
                              value={newQ.correctAnswer}
                              onChange={(e) =>
                                setNewQ((q) => ({
                                  ...q,
                                  correctAnswer: e.target.value,
                                }))
                              }
                            >
                              <option value="A">A</option>
                              <option value="B">B</option>
                              <option value="C">C</option>
                              <option value="D">D</option>
                            </select>
                          </div>
                          <div className="col-md-8 d-flex align-items-end justify-content-end ">
                            <button
                              type="submit"
                              className="btn btn-primary rounded-pill"
                            >
                              Add Question
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <hr />

              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5>All Questions</h5>
                <input
                  className="form-control rounded-pill w-auto"
                  placeholder="Search questions..."
                  value={questionSearch}
                  onChange={(e) => setQuestionSearch(e.target.value)}
                />
              </div>

              <div className="table-responsive">
                <table className="table table-hover align-middle table-borderless">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Question</th>
                      <th>Subject</th>
                      <th>Answer</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredQuestions.map((q, idx) => (
                      <tr key={q.id}>
                        <td>{idx + 1}</td>
                        <td style={{ maxWidth: 400 }}>{q.questionText}</td>
                        <td>{q.subject?.name || "-"}</td>
                        <td>{q.correctAnswer}</td>
                        <td className="text-end">
                          <button
                            className="btn btn-sm btn-outline-primary me-2 rounded-pill"
                            onClick={() =>
                              setEditQ({
                                ...q,
                                options: q.options || {},
                              })
                            }
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger rounded-pill"
                            onClick={() => handleDeleteQuestion(q.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {!filteredQuestions.length && (
                      <tr>
                        <td colSpan={5} className="text-center text-muted">
                          No questions found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {editQ && (
                <div className="card mt-3 shadow-sm">
                  <div className="card-body">
                    <div className="d-flex justify-content-between">
                      <h6>Edit Question</h6>
                      <button
                        className="btn-close"
                        onClick={() => setEditQ(null)}
                      ></button>
                    </div>
                    <hr />
                    <form className="row g-3" onSubmit={handleUpdateQuestion}>
                      <div className="col-12">
                        <textarea
                          className="form-control rounded-pill px-3"
                          rows={2}
                          value={editQ.questionText}
                          onChange={(e) =>
                            setEditQ((prev) => ({
                              ...prev,
                              questionText: e.target.value,
                            }))
                          }
                        />
                      </div>
                      {["A", "B", "C", "D"].map((optKey) => (
                        <div className="col-md-6" key={optKey}>
                          <input
                            className="form-control rounded-pill px-3"
                            placeholder={`Option ${optKey}`}
                            value={editQ.options?.[optKey] || ""}
                            onChange={(e) =>
                              setEditQ((prev) => ({
                                ...prev,
                                options: {
                                  ...(prev.options || {}),
                                  [optKey]: e.target.value,
                                },
                              }))
                            }
                          />
                        </div>
                      ))}
                      <div className="col-md-4">
                        <label className="form-label small">
                          Correct Answer
                        </label>
                        <select
                          className="form-select"
                          value={editQ.correctAnswer}
                          onChange={(e) =>
                            setEditQ((prev) => ({
                              ...prev,
                              correctAnswer: e.target.value,
                            }))
                          }
                        >
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="C">C</option>
                          <option value="D">D</option>
                        </select>
                      </div>
                      <div className="col-md-8 d-flex align-items-end justify-content-end">
                        <button
                          type="submit"
                          className="btn btn-primary px-4 rounded-pill"
                        >
                          Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </>
          )}

          {activeMenu === "subjects" && (
            <>
              <h5 className="mb-3">Manage Subjects</h5>
              <form
                className="row g-2 align-items-center mb-3"
                onSubmit={handleAddSubject}
              >
                <div className="col-sm-6 col-md-4">
                  <input
                    className="form-control rounded-pill px-3"
                    placeholder="New subject name..."
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                  />
                </div>
                <div className="col-auto">
                  <button className="btn btn-primary rounded-pill" type="submit">
                    Add Subject
                  </button>
                </div>
              </form>

              <div className="table-responsive">
                <table className="table table-hover align-middle table-borderless">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.map((s, idx) => (
                      <tr key={s.id}>
                        <td>{idx + 1}</td>
                        <td>{s.name}</td>
                        <td className="text-end">
                          <button
                            className="btn btn-sm btn-outline-danger me-2 rounded-pill"
                            onClick={() => handleDeleteSubject(s.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {!subjects.length && (
                      <tr>
                        <td colSpan={3} className="text-center text-muted">
                          No subjects yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
          {activeMenu === "announcements" && (
  <>
    <h5 className="mb-3">Announcements</h5>

    <form className="mb-4" onSubmit={handleAddAnnouncement}>
      <input
  className="form-control mb-2"
  placeholder="Announcement title"
  value={newAnnouncementTitle}
  onChange={(e) => setNewAnnouncementTitle(e.target.value)}
/>

      <textarea
        className="form-control mb-2"
        rows={3}
        placeholder="Write an announcement for all users..."
        value={newAnnouncement}
        onChange={(e) => setNewAnnouncement(e.target.value)}
      />
      <button className="btn btn-primary rounded-pill">Post Announcement</button>
    </form>

    <div className="list-group">

      {announcements.length === 0 ? (
  <p className="text-muted">No announcements yet.</p>
) : (
  announcements.map((a) => (
    <div
      key={a.id}
      className="border-0 shadow-sm rounded-4 p-3 mb-3"
      style={{ backgroundColor: "#fff8f0" }}
    >

      <div className="d-flex justify-content-between">
        <div>
          <h6 className="fw-bold mb-1">{a.title || "Announcement"}</h6>
          <p className="mb-1">{a.message}</p>
          <small className="text-muted">
            {new Date(a.announcementDate).toLocaleString()}
          </small>
        </div>
        <button
          className="btn btn-sm btn-outline-danger rounded-pill"
          onClick={() => handleDeleteAnnouncement(a.id)}
        >
          Delete
        </button>
      </div>
    </div>
  ))
)}

    </div>
  </>
)}

          {activeMenu === "mock" && (
            <>
              <h5 className="mb-3">Mock Test Settings</h5>
              <form
                className="row g-3 align-items-end"
                onSubmit={handleSaveMockDuration}
              >
                <div className="col-auto">
                  <label className="form-label">Hours</label>
                  <input
                    type="number"
                    className="form-control"
                    min="0"
                    value={mockDuration.hours}
                    onChange={(e) =>
                      setMockDuration((d) => ({
                        ...d,
                        hours: Number(e.target.value),
                      }))
                    }
                  />
                </div>
                <div className="col-auto">
                  <label className="form-label">Minutes</label>
                  <input
                    type="number"
                    className="form-control"
                    min="0"
                    max="59"
                    value={mockDuration.minutes}
                    onChange={(e) =>
                      setMockDuration((d) => ({
                        ...d,
                        minutes: Number(e.target.value),
                      }))
                    }
                  />
                </div>
                <div className="col-auto">
                  <button className="btn btn-primary rounded-pill" type="submit">
                    Save Duration
                  </button>
                </div>
              </form>
              <p className="text-muted mt-3 mb-0">
                Current mock test duration used in the Mock Test page will
                reflect these settings.
              </p>
            </>
          )}

          {activeMenu === "analytics" && (
            <div className="row g-4">
              <div className="col-lg-6">
                <div
  className="card border-0 shadow rounded-4"
  style={{ backgroundColor: "#fff8f0" }}
>
                  <div className="card-body">
                    <h5 className="card-title">Active vs Inactive Users</h5>
                    <PieChart width={400} height={260}>
                      <Pie
                        data={[
                          { name: "Active", value: stats.activeUsers },
                          {
                            name: "Inactive",
                            value: stats.totalUsers - stats.activeUsers,
                          },
                        ]}
                        dataKey="value"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {pieColors.map((c, i) => (
                          <Cell key={i} fill={c} />
                        ))}
                      </Pie>
                      <Legend />
                    </PieChart>
                  </div>
                </div>
              </div>

              <div className="col-lg-6">
                <div
  className="card border-0 shadow rounded-4"
  style={{ backgroundColor: "#fff8f0" }}
>
                  <div className="card-body">
                    <h5 className="card-title">Questions Per Subject</h5>
                    {questionsPerSubject.length ? (
                      <BarChart
                        width={450}
                        height={260}
                        data={questionsPerSubject}
                        margin={{ top: 10, right: 20, left: 0, bottom: 50 }}
                        overflowX="auto"
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-20} textAnchor="end" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill={barColor} />
                      </BarChart>
                    ) : (
                      <p className="text-muted mb-0">
                        Add some questions to see distribution.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="col-12">
                <div
  className="card border-0 shadow rounded-4"
  style={{ backgroundColor: "#fff8f0" }}
>
                  <div className="card-body">
                    <h5 className="card-title">Top Performers</h5>
                    {topPerformers.length ? (
                      <div style={{ width: "100%", height: 260 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={topPerformers}
                              margin={{ top: 10, right: 20, left: 0, bottom: 40 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis
                                dataKey="name"
                                angle={-20}
                                textAnchor="end"
                                interval={0}
                              />

                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="avg" fill={lineColor} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>

                    ) : (
                      <p className="text-muted mb-0">
                        No scores yet to compute top performers.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
