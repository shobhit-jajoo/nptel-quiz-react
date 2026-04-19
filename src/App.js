import { useState, useEffect, useCallback } from "react";
import questionsData from "./ques.json";
import "./App.css";

// --- Utility Functions ---
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function prepareQuestions(questions) {
  return shuffle(questions).map((q) => ({
    ...q,
    options: shuffle(q.options),
  }));
}

// --- Screens ---
const SCREEN = {
  HOME: "HOME",
  WEEK_SELECT: "WEEK_SELECT",
  MULTI_WEEK_SELECT: "MULTI_WEEK_SELECT",
  QUIZ: "QUIZ",
  RESULTS: "RESULTS",
};

// --- Home Screen ---
function HomeScreen({ onSelect, wrongCount }) {
  const weeks = [...new Set(questionsData.map((q) => q.week))].sort(
    (a, b) => a - b
  );

  return (
    <div className="home-screen">
      <div className="home-hero">
        <div className="logo-mark">
          <span>SDG</span>
          <div className="logo-dot" />
        </div>
        <h1>Quiz Arena</h1>
        <p className="tagline">Master the Sustainable Development Goals</p>
      </div>

      <div className="mode-grid">
        <button
          className="mode-card card-week"
          onClick={() => onSelect("week")}
        >
          <div className="card-icon">📅</div>
          <h2>Week Wise</h2>
          <p>Practice questions from a specific week at your own pace</p>
          <div className="card-badge">{weeks.length} Weeks</div>
        </button>

        <button
          className="mode-card card-multi"
          onClick={() => onSelect("multi")}
        >
          <div className="card-icon">🗓️</div>
          <h2>Multi-Week</h2>
          <p>Pick multiple weeks and quiz across all selected content</p>
          <div className="card-badge">{weeks.length} Weeks</div>
        </button>

        <button
          className="mode-card card-full"
          onClick={() => onSelect("full")}
        >
          <div className="card-icon">🌐</div>
          <h2>Full Syllabus</h2>
          <p>Challenge yourself with questions from the entire syllabus</p>
          <div className="card-badge">{questionsData.length} Questions</div>
        </button>

        <button
          className={`mode-card card-review ${wrongCount === 0 ? "disabled" : ""}`}
          onClick={() => wrongCount > 0 && onSelect("review")}
          disabled={wrongCount === 0}
        >
          <div className="card-icon">🔁</div>
          <h2>Review Wrong</h2>
          <p>Revisit and practice the questions you got wrong</p>
          {wrongCount > 0 ? (
            <div className="card-badge badge-red">{wrongCount} to review</div>
          ) : (
            <div className="card-badge badge-muted">Complete a test first</div>
          )}
        </button>
      </div>
    </div>
  );
}

// --- Week Select Screen (single week) ---
function WeekSelectScreen({ onBack, onSelect }) {
  const weeks = [...new Set(questionsData.map((q) => q.week))].sort(
    (a, b) => a - b
  );

  return (
    <div className="week-screen">
      <button className="back-btn" onClick={onBack}>
        ← Back
      </button>
      <h2 className="section-title">Select a Week</h2>
      <div className="week-grid">
        {weeks.map((week) => {
          const count = questionsData.filter((q) => q.week === week).length;
          return (
            <button
              key={week}
              className="week-card"
              onClick={() => onSelect(week)}
            >
              <span className="week-number">Week {week}</span>
              <span className="week-count">{count} questions</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// --- Multi-Week Select Screen ---
// --- Multi-Week Select Screen ---
function MultiWeekSelectScreen({ onBack, onStart }) {
  const weeks = [...new Set(questionsData.map((q) => q.week))].sort(
    (a, b) => a - b
  );
  const minWeek = weeks[0];
  const maxWeek = weeks[weeks.length - 1];

  const [mode, setMode] = useState("pick"); // "pick" | "range"
  const [selected, setSelected] = useState(new Set());
  const [fromWeek, setFromWeek] = useState(minWeek);
  const [toWeek, setToWeek] = useState(maxWeek);

  const toggleWeek = (week) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(week)) next.delete(week);
      else next.add(week);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === weeks.length) setSelected(new Set());
    else setSelected(new Set(weeks));
  };

  const rangeWeeks = weeks.filter((w) => w >= fromWeek && w <= toWeek);

  const activeWeeks = mode === "range" ? rangeWeeks : [...selected];
  const totalQuestions = questionsData.filter((q) =>
    activeWeeks.includes(q.week)
  ).length;

  return (
    <div className="week-screen">
      <button className="back-btn" onClick={onBack}>
        ← Back
      </button>
      <h2 className="section-title">Select Weeks</h2>
      <p className="section-subtitle">Pick individual weeks or a range</p>

      {/* Mode toggle */}
      <div className="mode-toggle">
        <button
          className={`toggle-tab ${mode === "pick" ? "toggle-tab-active" : ""}`}
          onClick={() => setMode("pick")}
        >
          Pick Weeks
        </button>
        <button
          className={`toggle-tab ${mode === "range" ? "toggle-tab-active" : ""}`}
          onClick={() => setMode("range")}
        >
          From – To
        </button>
      </div>

      {mode === "pick" && (
        <>
          <div className="multi-controls">
            <button className="toggle-all-btn" onClick={toggleAll}>
              {selected.size === weeks.length ? "Deselect All" : "Select All"}
            </button>
            <span className="selection-summary">
              {selected.size === 0
                ? "No weeks selected"
                : `${selected.size} week${selected.size > 1 ? "s" : ""} · ${totalQuestions} questions`}
            </span>
          </div>

          <div className="week-grid">
            {weeks.map((week) => {
              const count = questionsData.filter((q) => q.week === week).length;
              const isSelected = selected.has(week);
              return (
                <button
                  key={week}
                  className={`week-card ${isSelected ? "week-card-selected" : ""}`}
                  onClick={() => toggleWeek(week)}
                >
                  <span className="week-check">{isSelected ? "✓" : ""}</span>
                  <span className="week-number">Week {week}</span>
                  <span className="week-count">{count} questions</span>
                </button>
              );
            })}
          </div>
        </>
      )}

      {mode === "range" && (
        <div className="range-panel">
          <div className="range-row">
            <div className="range-field">
              <label className="range-label">From</label>
              <select
                className="range-select"
                value={fromWeek}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setFromWeek(val);
                  if (val > toWeek) setToWeek(val);
                }}
              >
                {weeks.map((w) => (
                  <option key={w} value={w}>
                    Week {w}
                  </option>
                ))}
              </select>
            </div>

            <div className="range-arrow">→</div>

            <div className="range-field">
              <label className="range-label">To</label>
              <select
                className="range-select"
                value={toWeek}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setToWeek(val);
                  if (val < fromWeek) setFromWeek(val);
                }}
              >
                {weeks.map((w) => (
                  <option key={w} value={w}>
                    Week {w}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="range-summary">
            <span className="range-summary-weeks">
              {rangeWeeks.length} week{rangeWeeks.length !== 1 ? "s" : ""}
            </span>
            <span className="range-summary-dot">·</span>
            <span>{totalQuestions} questions</span>
          </div>

          <div className="range-preview">
            {rangeWeeks.map((w) => (
              <span key={w} className="range-week-chip">
                W{w}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="multi-start-wrap">
        <button
          className="multi-start-btn"
          disabled={totalQuestions === 0}
          onClick={() => onStart(activeWeeks)}
        >
          {totalQuestions === 0
            ? "Select at least one week"
            : `Start Quiz · ${totalQuestions} Questions →`}
        </button>
      </div>
    </div>
  );
}

// --- Quiz Screen ---
function QuizScreen({ questions, onFinish, onBack }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [results, setResults] = useState([]);
  const [locked, setLocked] = useState(false);

  const q = questions[current];
  const total = questions.length;
  const progress = (current / total) * 100;

  const handleAnswer = useCallback(
    (option) => {
      if (locked) return;
      setSelected(option);
      setLocked(true);

      const isCorrect = option === q.answer;
      const result = { question: q, chosen: option, correct: isCorrect };

      setTimeout(() => {
        const newResults = [...results, result];
        if (current + 1 < total) {
          setResults(newResults);
          setCurrent((c) => c + 1);
          setSelected(null);
          setLocked(false);
        } else {
          onFinish(newResults);
        }
      }, 2000);
    },
    [locked, q, results, current, total, onFinish]
  );

  const getOptionClass = (opt) => {
    if (!selected) return "option-btn";
    if (opt === q.answer) return "option-btn correct";
    if (opt === selected) return "option-btn wrong";
    return "option-btn faded";
  };

  return (
    <div className="quiz-screen">
      <div className="quiz-header">
        <button className="back-btn" onClick={onBack}>
          ← Quit
        </button>
        <div className="quiz-counter">
          {current + 1} / {total}
        </div>
      </div>

      <div className="progress-bar-wrap">
        <div className="progress-bar" style={{ width: `${progress}%` }} />
      </div>

      <div className="question-card">
        <div className="question-num">Q{current + 1}</div>
        <p className="question-text">{q.question}</p>
      </div>

      <div className="options-grid">
        {q.options.map((opt, i) => (
          <button
            key={i}
            className={getOptionClass(opt)}
            onClick={() => handleAnswer(opt)}
          >
            <span className="opt-letter">{String.fromCharCode(65 + i)}</span>
            <span className="opt-text">{opt}</span>
            {selected && opt === q.answer && (
              <span className="opt-icon">✓</span>
            )}
            {selected && opt === selected && opt !== q.answer && (
              <span className="opt-icon">✗</span>
            )}
          </button>
        ))}
      </div>

      {selected && (
        <p className="next-hint">
          {selected === q.answer ? "✅ Correct!" : "❌ Wrong!"} Moving to
          next…
        </p>
      )}
    </div>
  );
}

// --- Results Screen ---
function ResultsScreen({ results, onHome, onReview }) {
  const correct = results.filter((r) => r.correct).length;
  const wrong = results.filter((r) => !r.correct);
  const score = Math.round((correct / results.length) * 100);

  const emoji =
    score >= 80 ? "🏆" : score >= 60 ? "👍" : score >= 40 ? "🤔" : "💪";

  return (
    <div className="results-screen">
      <div className="score-hero">
        <div className="score-emoji">{emoji}</div>
        <div className="score-ring">
          <svg viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" className="ring-bg" />
            <circle
              cx="60"
              cy="60"
              r="52"
              className="ring-fill"
              strokeDasharray={`${(score / 100) * 326.7} 326.7`}
              strokeDashoffset="0"
            />
          </svg>
          <div className="score-text">
            <span className="score-num">{score}%</span>
            <span className="score-label">Score</span>
          </div>
        </div>
        <div className="score-stats">
          <div className="stat correct-stat">
            <span>{correct}</span> Correct
          </div>
          <div className="stat wrong-stat">
            <span>{wrong.length}</span> Wrong
          </div>
        </div>
      </div>

      {wrong.length > 0 && (
        <div className="wrong-review">
          <h3 className="review-heading">Questions You Missed</h3>
          {wrong.map((r, i) => (
            <div key={i} className="review-card">
              <p className="review-q">{r.question.question}</p>
              <div className="review-options">
                {r.question.options.map((opt, j) => (
                  <div
                    key={j}
                    className={`review-opt ${
                      opt === r.question.answer
                        ? "rev-correct"
                        : opt === r.chosen
                        ? "rev-wrong"
                        : "rev-neutral"
                    }`}
                  >
                    <span className="rev-letter">
                      {String.fromCharCode(65 + j)}
                    </span>
                    <span>{opt}</span>
                    {opt === r.question.answer && (
                      <span className="rev-tag">✓ Correct</span>
                    )}
                    {opt === r.chosen && opt !== r.question.answer && (
                      <span className="rev-tag">✗ Your answer</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="results-actions">
        <button className="action-btn primary-btn" onClick={onHome}>
          🏠 Home
        </button>
        {wrong.length > 0 && (
          <button className="action-btn secondary-btn" onClick={onReview}>
            🔁 Practice Wrong ({wrong.length})
          </button>
        )}
      </div>
    </div>
  );
}

// --- App ---
export default function App() {
  const [screen, setScreen] = useState(SCREEN.HOME);
  const [mode, setMode] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizResults, setQuizResults] = useState([]);

  const [wrongQuestions, setWrongQuestions] = useState(() => {
    const saved = localStorage.getItem("sdg-wrong-questions");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("sdg-wrong-questions", JSON.stringify(wrongQuestions));
  }, [wrongQuestions]);

  const handleHomeSelect = (option) => {
    if (option === "week") {
      setScreen(SCREEN.WEEK_SELECT);
    } else if (option === "multi") {
      setScreen(SCREEN.MULTI_WEEK_SELECT);
    } else if (option === "full") {
      setMode("full");
      setQuizQuestions(prepareQuestions(questionsData));
      setScreen(SCREEN.QUIZ);
    } else if (option === "review") {
      setMode("review");
      setQuizQuestions(prepareQuestions(wrongQuestions));
      setScreen(SCREEN.QUIZ);
    }
  };

  const handleWeekSelect = (week) => {
    const weekQs = questionsData.filter((q) => q.week === week);
    setMode(`week-${week}`);
    setQuizQuestions(prepareQuestions(weekQs));
    setScreen(SCREEN.QUIZ);
  };

  const handleMultiWeekStart = (selectedWeeks) => {
    const qs = questionsData.filter((q) => selectedWeeks.includes(q.week));
    setMode(`multi-${selectedWeeks.join(",")}`);
    setQuizQuestions(prepareQuestions(qs));
    setScreen(SCREEN.QUIZ);
  };

  const handleQuizFinish = (results) => {
    setQuizResults(results);

    const newlyWrong = results.filter((r) => !r.correct).map((r) => r.question);
    const newlyCorrectIds = results
      .filter((r) => r.correct)
      .map((r) => r.question.id);

    setWrongQuestions((prev) => {
      const stillWrong = prev.filter((q) => !newlyCorrectIds.includes(q.id));
      const combined = [...stillWrong, ...newlyWrong];
      const seen = new Set();
      return combined.filter((q) => {
        if (seen.has(q.id)) return false;
        seen.add(q.id);
        return true;
      });
    });

    setScreen(SCREEN.RESULTS);
  };

  const goHome = () => setScreen(SCREEN.HOME);

  return (
    <div className="app">
      <div className="app-bg" />
      <div className="app-container">
        {screen === SCREEN.HOME && (
          <HomeScreen
            onSelect={handleHomeSelect}
            wrongCount={wrongQuestions.length}
          />
        )}
        {screen === SCREEN.WEEK_SELECT && (
          <WeekSelectScreen onBack={goHome} onSelect={handleWeekSelect} />
        )}
        {screen === SCREEN.MULTI_WEEK_SELECT && (
          <MultiWeekSelectScreen onBack={goHome} onStart={handleMultiWeekStart} />
        )}
        {screen === SCREEN.QUIZ && (
          <QuizScreen
            questions={quizQuestions}
            onFinish={handleQuizFinish}
            onBack={goHome}
          />
        )}
        {screen === SCREEN.RESULTS && (
          <ResultsScreen
            results={quizResults}
            onHome={goHome}
            onReview={() => {
              setMode("review");
              setQuizQuestions(prepareQuestions(wrongQuestions));
              setScreen(SCREEN.QUIZ);
            }}
          />
        )}
      </div>
    </div>
  );
}