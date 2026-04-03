import { useEffect, useState } from "react";
import hint from "../assets/hint1.png"; 
import loadingGif from "../assets/thinking1.mp4";

export default function Practice() {
  const [subjects, setSubjects] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [loadingExp, setLoadingExp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showHintBox, setShowHintBox] = useState(false);

  useEffect(() => {
    fetch("http://localhost:8081/api/subjects")
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched subjects:", data);
        setSubjects(data);
      })
      .catch((e) => console.error("Error fetching subjects:", e));
  }, []);

  useEffect(() => {
    if (!selectedSubject) return;

    setLoading(true);
    setQuestions([]);
    setCurrent(0);
    setShowAnswer(false);
    setExplanation("");
    setSelected(null);
    setShowHintBox(false);

    fetch(`http://localhost:8081/api/questions/subject/${selectedSubject}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched questions:", data);
        setQuestions(data);
      })
      .catch((err) =>
        console.error("Failed to load subject questions:", err)
      )
      .finally(() => setLoading(false));
  }, [selectedSubject]);

  if (loading && questions.length === 0) {
    return <p className="text-center mt-5">Loading questions...</p>;
  }

  if (!loading && selectedSubject && questions.length === 0) {
  return (
    <div className="container text-center my-5">

      <button
        className="btn btn-outline-primary mb-3"
        onClick={exitPractice}
      >
        ⬅ Back to Subjects
      </button>

      <p className="text-danger fs-5">
        No questions found for this subject.
      </p>
    </div>
  );
}


const currentQ = questions[current];

if (!selectedSubject) {
}
if (selectedSubject && (!questions || questions.length === 0)) {
  return (
    <div className="container my-5 text-center">
      <p className="fs-5 text-muted">Loading questions... (or no questions available)</p>
      <button className="btn btn-outline-secondary mt-3" onClick={exitPractice}>
        Back to subjects
      </button>
    </div>
  );
}


  const handleOptionClick = (key) => {
    if (showAnswer) return;
    setSelected(key);
    setShowAnswer(true);
  };

  const nextQuestion = () => {
    if (current + 1 < questions.length) {
      setShowAnswer(false);
      setSelected(null);
      setExplanation("");
      setShowHintBox(false);
      setCurrent((c) => c + 1);
    } else {
      alert("You've completed all questions in this subject!");
    }
  };

  const prevQuestion = () => {
    if (current > 0) {
      setShowAnswer(false);
      setSelected(null);
      setExplanation("");
      setShowHintBox(false);
      setCurrent((c) => c - 1);
    }
  };

  function exitPractice() {
    setSelectedSubject(null);
    setQuestions([]);
    setCurrent(0);
    setShowAnswer(false);
    setSelected(null);
    setShowHintBox(false);
    setExplanation("");
  };

  const handleHintClick = async () => {
    if (!currentQ) return;
    setShowHintBox(true);
    setLoadingExp(true);
    setExplanation("");

    try {
      const response = await fetch("http://localhost:8081/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: currentQ?.questionText,
          answer: currentQ?.correctAnswer,
        }),
      });

      const data = await response.json();
      setExplanation(data.explanation || "No explanation available.");
    } catch (error) {
      console.error("Error fetching explanation:", error);
      setExplanation("Failed to load explanation.");
    } finally {
      setLoadingExp(false);
    }
  };

  if (!selectedSubject) {
    return (
      <div className="container my-5 text-center">
        <h3 className="mb-4 fw-bold">Choose a Subject to Practice</h3>

        <div className="row justify-content-center">
          {subjects.map((s) => (
            <div
              key={s.id}
              className="col-md-3 col-sm-6 mb-3"
            >
              <div
                className="card p-3 text-center border-0 shadow rounded-4"
                style={{
                  cursor: "pointer",
                  backgroundColor: "#fff8f0",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 10px 20px rgba(0,0,0,0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "";
                }}
                onClick={() => setSelectedSubject(s.id)}
              >

                <h6 className="fw-bold">{s.name}</h6>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container my-5 position-relative" style={{ maxWidth: "750px" }}>
    <button
  className="btn btn-outline-primary mb-3"
  onClick={exitPractice}
>
  ⬅ Back to Subjects
</button>

      <div
  className="card border-0 shadow rounded-4 p-3 p-md-4 text-center position-relative"
  style={{ backgroundColor: "#fff8f0" }}
>

        {/* Hint Icon */}
        <img
          src={hint}
          alt="Hint"
          onClick={handleHintClick}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            width: "45px",
            height: "45px",
            cursor: loadingExp ? "wait" : "pointer",
            objectFit: "cover",
          }}
          className="hint-icon"
          title="Get Hint"
        />

        <h5 className="mb-3 fw-semibold" style={{ color: "#6f4e37" }}>
          Question {current + 1} of {questions.length}
        </h5>

        <p className="fs-5 mb-4">{currentQ?.questionText}</p>

        {/* Options */}
        {currentQ?.optionsJson ? (
          Object.entries(JSON.parse(currentQ?.optionsJson)).map(([key, value]) => {
            const isSelected = selected === key;
            const isCorrect = showAnswer && key === currentQ?.correctAnswer;
            const optionClass = showAnswer
              ? isCorrect
                ? "btn-success text-white"
                : isSelected
                ? "btn-danger text-white"
                : "btn-outline-secondary"
              : "btn-outline-secondary";

            return (
              <button
                key={key}
                className={`btn d-block w-100 text-start mb-2 py-3 rounded-4 ${optionClass}`}
                  style={{
                    transition: "transform 0.15s ease, box-shadow 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!showAnswer) e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                  }}

                onClick={() => handleOptionClick(key)}
                disabled={showAnswer}
              >
                {key}. {value}
              </button>
            );
          })
        ) : (
          <div className="alert alert-warning">
            ⚠️ Options missing for this question. Please contact admin.
          </div>
        )}

        {/* Feedback */}
        {showAnswer && (
          <div
        className="mt-3 p-3 rounded-4"
        style={{ backgroundColor: "#eadbc8" }}
      >

            {selected === currentQ?.correctAnswer ? (
              <p className="text-success mb-2 py-3">✅ Correct!</p>
            ) : (
              <p className="text-danger mb-2 py-3">
                ❌ Wrong! Correct answer: {currentQ?.correctAnswer}
              </p>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="d-flex justify-content-between mt-3">
          <button
            className="btn btn-outline-secondary rounded-pill px-4"
            onClick={prevQuestion}
            disabled={current === 0}
          >
            Previous
          </button>

          <button
            className="btn btn-primary rounded-pill px-4"
            onClick={nextQuestion}
          >
            {current + 1 === questions.length ? "Finish" : "Next"}
          </button>
        </div>
      </div>

      {/* Hint Popup */}
      {showHintBox && (
        <div
          className="card shadow-sm p-3 position-absolute"
         style={{
            top: "20px",
            right: "10px",
            width: "90%",
            maxWidth: "280px",
            background: "#f7f7f7ff",
            borderRadius: "12px",
            zIndex: 10,
            animation: "fadeIn 0.2s ease-in-out",
          }}
        >
          <div className="d-flex justify-content-between align-items-center mb-2 py-3">
            <h6 className="mb-0" style={{ color: "#6f4e37" }}> Hint</h6>
            <button
              className="btn btn-sm btn-light"
              onClick={() => setShowHintBox(false)}
            >
              ❌
            </button>
          </div>

          {loadingExp ? (
            <div className="text-center text-muted small">
              <video src={loadingGif} width="60" height="80" autoPlay loop muted></video>
              <div>Thinking...</div>
            </div>
          ) : (
            <p style={{ fontSize: "0.95rem" }}>{explanation}</p>
          )}
        </div>
      )}

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(5px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
}
