import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import {
  RadioQuestion,
  CheckboxQuestion,
  RatingQuestion,
  TextareaQuestion,
} from "../components/QuestionTypes";
import { sampleSurvey } from "../data/surveyData";
import "./SurveyPage.css";

export default function SurveyPage() {
  const { id } = useParams();
   const navigate = useNavigate();
  const [survey,    setSurvey]    = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [current,   setCurrent]   = useState(0);
  const [answers,   setAnswers]   = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [animDir,   setAnimDir]   = useState("forward");
  const [visible,   setVisible]   = useState(true);

  useEffect(() => {
    API.get(`/surveys/${id}`)
      .then((res) => { setSurvey(res.data); setLoading(false); })
      .catch(() => { setSurvey(sampleSurvey); setLoading(false); });
  }, [id]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Enter" && !submitted) goNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [current, answers, submitted, survey]);

  if (loading) return <div style={{ padding: "40px", textAlign: "center" }}>Loading survey...</div>;
  if (!survey)  return <div style={{ padding: "40px", textAlign: "center" }}>Survey not found.</div>;

  const total    = survey.questions.length;
  const question = survey.questions[current];
  const progress = Math.round((current / total) * 100);
  const answer   = answers[question?.id];

  const isAnswered = () => {
    if (!question) return false;
    if (!question.required) return true;
    if (question.type === "checkbox") return answer?.length > 0;
    return answer !== undefined && answer !== null && answer !== "";
  };

  const animateTransition = (direction, callback) => {
    setAnimDir(direction);
    setVisible(false);
    setTimeout(() => { callback(); setVisible(true); }, 220);
  };

  const goNext = async () => {
    if (!isAnswered()) return;
    if (current < total - 1) {
      animateTransition("forward", () => setCurrent((c) => c + 1));
    } else {
  try {
    await API.post("/responses", {
      surveyId: survey._id,
      answers: Object.entries(answers).map(([questionId, answer], index) => ({
        questionIndex: index,
        answer: Array.isArray(answer) ? answer.join(", ") : String(answer),
      })),
    });
  } catch (err) {
    console.error("Failed to save response:", err.message);
  }
  setSubmitted(true);
setTimeout(() => { navigate("/builder"); }, 2000);
}
  };

  const goBack = () => {
    if (current > 0) animateTransition("back", () => setCurrent((c) => c - 1));
  };

  const setAnswer = (id, val) => setAnswers((prev) => ({ ...prev, [id]: val }));

  const restart = () => {
    setCurrent(0); setAnswers({}); setSubmitted(false); setVisible(true);
  };

  if (submitted) {
    return (
      <div className="survey-page">
        <div className="survey-container">
          <div className="success-screen">
            <div className="success-icon-wrap">
              <svg viewBox="0 0 48 48" fill="none" className="success-svg">
                <circle cx="24" cy="24" r="23" stroke="#2d5a3d" strokeWidth="2"/>
                <path d="M14 24l7 7 13-13" stroke="#2d5a3d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className="success-title">Thank you!</h2>
            <p className="success-sub">Your response has been recorded.</p>
            <button className="btn-restart" onClick={restart}>Submit another response</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="survey-page">
      <div className="survey-container">
        {current === 0 && (
          <div className="survey-intro">
            <h1 className="survey-title">{survey.title}</h1>
            <p className="survey-desc">{survey.description}</p>
          </div>
        )}
        <div className="progress-wrap">
          <div className="progress-meta">
            <span className="progress-label">Question {current + 1} of {total}</span>
            <span className="progress-pct">{progress}% complete</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progress}%` }}/>
          </div>
        </div>
        <div className={`question-card ${visible ? "card-visible" : "card-hidden"} ${animDir === "back" ? "from-left" : "from-right"}`}>
          <div className="q-meta">
            <span className="q-number">{String(current + 1).padStart(2, "0")}</span>
            {question.required && <span className="q-required-badge">Required</span>}
            <span className="q-type-badge">{question.type}</span>
          </div>
          <h2 className="q-text">{question.text}</h2>
          <div className="q-input">
            {question.type === "radio"    && <RadioQuestion    question={question} value={answer} onChange={(val) => setAnswer(question.id, val)}/>}
            {question.type === "checkbox" && <CheckboxQuestion question={question} value={answer} onChange={(val) => setAnswer(question.id, val)}/>}
            {question.type === "rating"   && <RatingQuestion   question={question} value={answer} onChange={(val) => setAnswer(question.id, val)}/>}
            {question.type === "textarea" && <TextareaQuestion question={question} value={answer} onChange={(val) => setAnswer(question.id, val)}/>}
          </div>
        </div>
        <div className="nav-row">
          <button className="btn-back" onClick={goBack} style={{ visibility: current === 0 ? "hidden" : "visible" }}>
            Back
          </button>
          <button className={`btn-next ${isAnswered() ? "enabled" : "disabled"}`} onClick={goNext} disabled={!isAnswered()}>
            {current === total - 1 ? "Submit" : "Next"}
          </button>
        </div>
        <p className="keyboard-hint">Press <kbd>Enter</kbd> to continue</p>
      </div>
    </div>
  );
}