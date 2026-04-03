import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function MockTest() {
  const { user } = useAuth();

  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [started, setStarted] = useState(false);

  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(0);

  const [mockDuration, setMockDuration] = useState({ hours: 0, minutes: 10 });
  const [showRestartMsg, setShowRestartMsg] = useState(false);

  // FETCH QUESTIONS + MOCK DURATION
  useEffect(() => {
    async function loadData() {
      try {
        // Fetch questions
        const qRes = await fetch("http://localhost:8081/api/questions");
        const qData = await qRes.json();

        // Auto-parse optionsJson
        const parsed = qData.map((q) => ({
          ...q,
          options:
            typeof q.optionsJson === "string"
              ? JSON.parse(q.optionsJson)
              : q.options || {},
        }));

        setQuestions(parsed.slice(0, 10)); // take 10 questions

        // Fetch mock duration
        const dRes = await fetch("http://localhost:8081/api/mock-duration");
        const dData = await dRes.json();

        let hours = 0;
        let minutes = 0;

        if (typeof dData.durationMinutes === "number") {
          hours = Math.floor(dData.durationMinutes / 60);
          minutes = dData.durationMinutes % 60;
        } else {
          hours = dData.hours || 0;
          minutes = dData.minutes || 0;
        }

        setMockDuration({ hours, minutes });
      } catch (err) {
        console.error("Failed to load test data:", err);
      }
    }

    loadData();
  }, []);

  // TIMER
  useEffect(() => {
    if (!started || submitted) return;

    if (timeLeft <= 0) {
      handleSubmit(); // auto-submit
      return;
    }

    const t = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(t);
  }, [started, submitted, timeLeft]);

  // Prevent copying / cheating
  useEffect(() => {
    if (!started || submitted) return;

    const prevent = (e) => e.preventDefault();
    const blockKeys = (e) => {
      if (
        e.ctrlKey &&
        ["c", "v", "x", "s", "p", "u"].includes(e.key.toLowerCase())
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener("contextmenu", prevent);
    document.addEventListener("copy", prevent);
    document.addEventListener("cut", prevent);
    document.addEventListener("paste", prevent);
    document.addEventListener("keydown", blockKeys);
    document.body.style.userSelect = "none";

    return () => {
      document.removeEventListener("contextmenu", prevent);
      document.removeEventListener("copy", prevent);
      document.removeEventListener("cut", prevent);
      document.removeEventListener("paste", prevent);
      document.removeEventListener("keydown", blockKeys);
      document.body.style.userSelect = "auto";
    };
  }, [started, submitted]);

  // FORMAT TIME
  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // SELECT ANSWER
  const handleSelect = (opt) => {
    setAnswers({ ...answers, [current]: opt });
  };

  const next = () =>
    current + 1 < questions.length && setCurrent((c) => c + 1);
  const prev = () => current > 0 && setCurrent((c) => c - 1);

  // SUBMIT TEST
  const handleSubmit = async () => {
    if (submitted) return;

    const unanswered = questions.length - Object.keys(answers).length;
    if (unanswered > 0) {
      if (!window.confirm(`You have ${unanswered} unanswered. Submit?`))
        return;
    }

    const correct = questions.filter(
      (q, i) => answers[i] === q.correctAnswer
    ).length;

    const percent =
      questions.length > 0
        ? Math.round((correct / questions.length) * 100)
        : 0;

    setSubmitted(true);

    try {
      await fetch("http://localhost:8081/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          score: percent,
          testType: "Mock Test",
        }),
      });
    } catch (err) {
      console.error("Score save failed:", err);
    }
  };

  // START SCREEN
  if (!started) {
    return (
      <div className="container my-5 text-center" style={{ maxWidth: 600 }}>
        <div
          className="card border-0 shadow rounded-4 p-4"
          style={{ backgroundColor: "#fff8f0" }}
        >

          <h3 className="mb-3">Mock Test</h3>
          <p className="text-muted">
            This test contains <strong>{questions.length}</strong> questions.
            <br />
            Time allowed:{" "}
            <strong>
              {mockDuration.hours} hour(s) {mockDuration.minutes} minute(s)
            </strong>
          </p>
          <p className="text-muted small">
            Once started, copy/paste and inspect actions are disabled.
          </p>

          <button
            className="btn btn-primary px-4"
            onClick={() => {
              const sec =
                mockDuration.hours * 3600 + mockDuration.minutes * 60;
              if (sec <= 0)
                return alert("Admin has not set a valid test duration.");

              setTotalTime(sec);
              setTimeLeft(sec);
              setStarted(true);
            }}
          >
            Start Test
          </button>
        </div>
      </div>
    );
  }

  const q = questions[current];
  if (!q)
    return (
      <div className="container my-5 text-center">
        <div className="alert alert-warning">No questions available.</div>
      </div>
    );

  // TEST UI
  return (
    <div className="container my-5" style={{ maxWidth: 700 }}>
      {!submitted ? (
        <>
          {/* TIMER */}
          <div className="mb-3">
            <div className="d-flex justify-content-between mb-1">
              <span
              className="badge fs-6 px-3 py-2 rounded-pill"
              style={{ backgroundColor: "#6f4e37" }}
>
                Time Left: {formatTime(timeLeft)}
              </span>
              <small className="text-muted">
                Total: {formatTime(totalTime)}
              </small>
            </div>
            <div className="progress" style={{ height: 8 }}>
              <div
                className={`progress-bar ${
                  timeLeft < totalTime * 0.2 ? "bg-danger" : "bg-success"
                }`}
                style={{
                  width: `${(timeLeft / totalTime) * 100}%`,
                  transition: "width 1s linear",
                }}
              ></div>
            </div>
          </div>

          {/* QUESTION */}
         <div
          className="card border-0 shadow rounded-4"
          style={{ backgroundColor: "#fff8f0", animation: "fadeIn 0.3s ease" }}

        >

            <div className="card-body">
              <h5>
                Question {current + 1} / {questions.length}
              </h5>
              <p className="fs-5">{q.questionText}</p>

              <div className="mt-3 px-1 px-md-3">
                {Object.entries(q.options).map(([k, v]) => (
                  <div className="form-check mb-2" key={k}>
                    <input
                      type="radio"
                      name={`q${current}`}
                      className="form-check-input"
                      checked={answers[current] === k}
                      onChange={() => handleSelect(k)}
                    />
                    <label className="form-check-label ms-2">
                      {k}. {v}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* NAVIGATION */}
          <div className="d-flex justify-content-between flex-column flex-md-row gap-2 mt-3">
            <button
              className="btn btn-outline-secondary"
              disabled={current === 0}
              onClick={prev}
            >
              Previous
            </button>

            {current < questions.length - 1 ? (
              <button
                className="btn btn-outline-primary"
                disabled={!answers[current]}
                onClick={next}
              >
                Next
              </button>
            ) : (
              <button className="btn btn-success" onClick={handleSubmit}>
                Submit
              </button>
            )}
          </div>

          <div className="text-center text-muted small mt-3">
            Answered: {Object.keys(answers).length}/{questions.length}
          </div>
        </>
      ) : (
        // RESULT SCREEN
        <div
          className="card border-0 shadow rounded-4 p-4 text-center"
          style={{ backgroundColor: "#fff8f0", animation: "fadeIn 0.3s ease" }}
        >

          <h4 className="text-success mb-3">Test Completed!</h4>

          {(() => {
            const correct = questions.filter(
              (q, i) => answers[i] === q.correctAnswer
            ).length;
            const percent = Math.round(
              (correct / questions.length) * 100
            );

            return (
              <>
                <p className="fs-5">
                  Correct: {correct}/{questions.length}
                </p>
                <p className="fs-5">Score: {percent}%</p>
                <p className="text-muted">
                  Time Remaining: {formatTime(timeLeft)}
                </p>
              </>
            );
          })()}

          {showRestartMsg && (
            <div className="alert alert-success mt-3 fade show">
              New test started!
            </div>
          )}

          <button
            className="btn btn-primary mt-3"
            onClick={() => {
              setAnswers({});
              setCurrent(0);
              setSubmitted(false);
              setStarted(false);
              setTimeLeft(0);
              setTotalTime(0);

              window.scrollTo({ top: 0, behavior: "smooth" });

              setShowRestartMsg(true);
              setTimeout(() => setShowRestartMsg(false), 1500);
            }}
          >
            Take Again
          </button>
        </div>
      )}
    </div>
  );
}
