import { useState } from "react";

// ─── Data ────────────────────────────────────────────────────────────────────

const CATEGORIES = [
  {
    id: "events",
    icon: "🎪",
    iconBg: "#FAEEDA",
    name: "Events",
    desc: "Conferences, concerts, workshops & more",
    surveys: [
      { name: "Tech Conference 2025", tag: "Live", tagClass: "green", qType: "event" },
      { name: "Annual Music Festival", tag: "Recent", tagClass: "amber", qType: "event" },
      { name: "Company Town Hall", tag: "Live", tagClass: "green", qType: "event" },
      { name: "Product Launch Event", tag: "Recent", tagClass: "amber", qType: "event" },
    ],
  },
  {
    id: "products",
    icon: "📦",
    iconBg: "#E6F1FB",
    name: "Products",
    desc: "Rate and review products you've used",
    surveys: [
      { name: "Electronics & Gadgets", tag: "Ongoing", tagClass: "blue", qType: "product" },
      { name: "Clothing & Apparel", tag: "Ongoing", tagClass: "blue", qType: "product" },
      { name: "Home Appliances", tag: "Ongoing", tagClass: "blue", qType: "product" },
      { name: "Books & Media", tag: "New", tagClass: "green", qType: "product" },
    ],
  },
  {
    id: "shopping",
    icon: "🛍️",
    iconBg: "#FBEAF0",
    name: "Shopping Malls",
    desc: "Share your mall & retail experience",
    surveys: [
      { name: "Forum Mall Experience", tag: "Live", tagClass: "green", qType: "mall" },
      { name: "Phoenix MarketCity", tag: "Live", tagClass: "green", qType: "mall" },
      { name: "Orion Mall Visit", tag: "Ongoing", tagClass: "blue", qType: "mall" },
    ],
  },
  {
    id: "restaurants",
    icon: "🍽️",
    iconBg: "#EAF3DE",
    name: "Restaurants",
    desc: "Food, service & dining experience",
    surveys: [
      { name: "Fine Dining Experience", tag: "Live", tagClass: "green", qType: "restaurant" },
      { name: "Quick Service Restaurants", tag: "Ongoing", tagClass: "blue", qType: "restaurant" },
      { name: "Cafe & Bakeries", tag: "Ongoing", tagClass: "blue", qType: "restaurant" },
      { name: "Street Food & Local", tag: "New", tagClass: "green", qType: "restaurant" },
    ],
  },
  {
    id: "education",
    icon: "🎓",
    iconBg: "#E1F5EE",
    name: "Education",
    desc: "Courses, tutors & learning platforms",
    surveys: [
      { name: "Online Course Quality", tag: "Ongoing", tagClass: "blue", qType: "education" },
      { name: "School Infrastructure", tag: "Ongoing", tagClass: "blue", qType: "education" },
      { name: "Training Programs", tag: "New", tagClass: "green", qType: "education" },
    ],
  },
  {
    id: "healthcare",
    icon: "🏥",
    iconBg: "#FCEBEB",
    name: "Healthcare",
    desc: "Hospitals, clinics & health services",
    surveys: [
      { name: "Hospital Visit Feedback", tag: "Ongoing", tagClass: "blue", qType: "healthcare" },
      { name: "Pharmacy Service", tag: "Ongoing", tagClass: "blue", qType: "healthcare" },
      { name: "Telemedicine Experience", tag: "New", tagClass: "green", qType: "healthcare" },
    ],
  },
  {
    id: "transport",
    icon: "🚌",
    iconBg: "#EEEDFE",
    name: "Transport",
    desc: "Public transit, taxis & travel",
    surveys: [
      { name: "City Bus Service", tag: "Ongoing", tagClass: "blue", qType: "transport" },
      { name: "Ride-hailing Apps", tag: "Ongoing", tagClass: "blue", qType: "transport" },
      { name: "Railway Journey", tag: "New", tagClass: "green", qType: "transport" },
    ],
  },
  {
  id: "hotels",           // unique id
  icon: "🏨",
  iconBg: "#F0EEF8",
  name: "Hotels",
  desc: "Stay, service & hospitality experience",
  surveys: [
    { name: "Luxury Hotel Stay", tag: "Live", tagClass: "green", qType: "hotel" },
    { name: "Budget Hotel Review", tag: "Ongoing", tagClass: "blue", qType: "hotel" },
    { name: "Resort Experience", tag: "New", tagClass: "green", qType: "hotel" },
  ],
},
  {
    id: "apps",
    icon: "📱",
    iconBg: "#B5D4F4",
    name: "Apps & Software",
    desc: "Digital products & online services",
    surveys: [
      { name: "Mobile App Usability", tag: "Live", tagClass: "green", qType: "app" },
      { name: "Website Experience", tag: "Ongoing", tagClass: "blue", qType: "app" },
      { name: "Customer Support Portal", tag: "New", tagClass: "green", qType: "app" },
    ],
  },
];

const QUESTION_SETS = {
  event: [
    { type: "rating", label: "How would you rate the overall event experience?", max: 5 },
    { type: "radio", label: "How was the venue and facilities?", opts: ["Excellent", "Good", "Average", "Poor"] },
    { type: "radio", label: "Was the event schedule well organized?", opts: ["Very well organized", "Mostly organized", "Somewhat disorganized", "Very disorganized"] },
    { type: "rating", label: "How likely are you to attend future events?", max: 5 },
    { type: "text", label: "Any additional comments or suggestions?" },
  ],
  product: [
    { type: "rating", label: "How satisfied are you with this product?", max: 5 },
    { type: "radio", label: "How is the product quality?", opts: ["Excellent", "Good", "Average", "Below Average"] },
    { type: "radio", label: "Was the pricing reasonable?", opts: ["Very reasonable", "Reasonable", "Expensive", "Very expensive"] },
    { type: "rating", label: "Would you recommend this product to others?", max: 5 },
    { type: "text", label: "What could be improved about this product?" },
  ],
  mall: [
    { type: "rating", label: "How was your overall shopping mall experience?", max: 5 },
    { type: "radio", label: "How clean and maintained was the mall?", opts: ["Very clean", "Clean", "Average", "Dirty"] },
    { type: "radio", label: "How was the variety of shops and brands?", opts: ["Excellent variety", "Good variety", "Limited variety", "Very limited"] },
    { type: "radio", label: "How was the parking facility?", opts: ["Excellent", "Good", "Average", "Poor", "No parking"] },
    { type: "text", label: "What would make your mall visit better?" },
  ],
  restaurant: [
    { type: "rating", label: "How was the overall dining experience?", max: 5 },
    { type: "rating", label: "How would you rate the food quality and taste?", max: 5 },
    { type: "radio", label: "How was the service speed?", opts: ["Very fast", "Acceptable", "Slow", "Very slow"] },
    { type: "radio", label: "Was the ambience comfortable?", opts: ["Very comfortable", "Comfortable", "Average", "Uncomfortable"] },
    { type: "text", label: "What dish did you try? Any suggestions for the chef?" },
  ],
  education: [
    { type: "rating", label: "How was the quality of teaching/content?", max: 5 },
    { type: "radio", label: "Were learning materials provided adequate?", opts: ["More than enough", "Adequate", "Insufficient", "Very insufficient"] },
    { type: "radio", label: "How interactive was the course/program?", opts: ["Very interactive", "Somewhat interactive", "Mostly passive", "Not interactive"] },
    { type: "rating", label: "Would you recommend this to others?", max: 5 },
    { type: "text", label: "What topics or improvements would you suggest?" },
  ],
  healthcare: [
    { type: "rating", label: "How satisfied were you with the overall service?", max: 5 },
    { type: "radio", label: "How long did you wait before being attended to?", opts: ["Less than 15 min", "15–30 min", "30–60 min", "Over 1 hour"] },
    { type: "radio", label: "How was the behaviour of the staff?", opts: ["Very courteous", "Courteous", "Neutral", "Rude"] },
    { type: "rating", label: "How clean and hygienic was the facility?", max: 5 },
    { type: "text", label: "Any suggestions for improving patient care?" },
  ],
  transport: [
    { type: "rating", label: "How satisfied are you with the transport service?", max: 5 },
    { type: "radio", label: "Was the vehicle/service on time?", opts: ["Always on time", "Usually on time", "Often late", "Always late"] },
    { type: "radio", label: "How was the cleanliness of the vehicle?", opts: ["Very clean", "Clean", "Average", "Dirty"] },
    { type: "rating", label: "Was the fare/pricing fair?", max: 5 },
    { type: "text", label: "How can we improve this transport service?" },
  ],
  app: [
    { type: "rating", label: "How easy was the app/website to use?", max: 5 },
    { type: "radio", label: "Did the app perform without crashes or errors?", opts: ["Always", "Mostly", "Sometimes crashed", "Frequently crashed"] },
    { type: "radio", label: "How was the loading speed?", opts: ["Very fast", "Fast", "Slow", "Very slow"] },
    { type: "rating", label: "Would you recommend this app to others?", max: 5 },
    { type: "text", label: "What features would you like to see added?" },
  ],
  hotel: [
  { type: "rating", label: "How was your overall stay experience?", max: 5 },
  { type: "radio", label: "How was the cleanliness of your room?", opts: ["Spotless", "Clean", "Average", "Dirty"] },
  { type: "radio", label: "How was the check-in/check-out process?", opts: ["Very smooth", "Smooth", "Average", "Very slow"] },
  { type: "rating", label: "How would you rate the staff helpfulness?", max: 5 },
  { type: "text", label: "Any suggestions to improve the hotel experience?" },
],
};

// ─── Tag colours ─────────────────────────────────────────────────────────────

const TAG_STYLES = {
  green: { bg: "#EAF3DE", color: "#27500A" },
  blue: { bg: "#E6F1FB", color: "#0C447C" },
  amber: { bg: "#FAEEDA", color: "#633806" },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function Tag({ label, variant }) {
  const s = TAG_STYLES[variant] || TAG_STYLES.blue;
  return (
    <span
      style={{
        display: "inline-block",
        fontSize: 11,
        fontWeight: 500,
        padding: "2px 8px",
        borderRadius: 10,
        background: s.bg,
        color: s.color,
      }}
    >
      {label}
    </span>
  );
}

function RatingQuestion({ question, index, value, onChange }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ width: 20, height: 20, borderRadius: "50%", background: "#E6F1FB", color: "#0C447C", fontSize: 11, fontWeight: 600, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
          {index + 1}
        </span>
        {question.label}
      </p>
      <div style={{ display: "flex", gap: 8 }}>
        {Array.from({ length: question.max }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            style={{
              width: 36,
              height: 36,
              border: "1px solid",
              borderColor: value >= n ? "#185FA5" : "#ddd",
              borderRadius: 6,
              background: value >= n ? "#185FA5" : "transparent",
              color: value >= n ? "#fff" : "#666",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.1s",
            }}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

function RadioQuestion({ question, index, value, onChange }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ width: 20, height: 20, borderRadius: "50%", background: "#E6F1FB", color: "#0C447C", fontSize: 11, fontWeight: 600, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
          {index + 1}
        </span>
        {question.label}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {question.opts.map((opt, j) => (
          <div
            key={j}
            onClick={() => onChange(j)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 10px",
              border: "1px solid",
              borderColor: value === j ? "#185FA5" : "#e0e0e0",
              borderRadius: 8,
              background: value === j ? "#E6F1FB" : "transparent",
              cursor: "pointer",
              fontSize: 13,
              color: value === j ? "#0C447C" : "#333",
              transition: "all 0.1s",
            }}
          >
            <span
              style={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                border: `1.5px solid ${value === j ? "#185FA5" : "#ccc"}`,
                background: value === j ? "#185FA5" : "transparent",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {value === j && (
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#fff", display: "block" }} />
              )}
            </span>
            {opt}
          </div>
        ))}
      </div>
    </div>
  );
}

function TextQuestion({ question, index, value, onChange }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ width: 20, height: 20, borderRadius: "50%", background: "#E6F1FB", color: "#0C447C", fontSize: 11, fontWeight: 600, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
          {index + 1}
        </span>
        {question.label}
      </p>
      <textarea
        rows={3}
        placeholder="Type your answer here…"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          border: "1px solid #e0e0e0",
          borderRadius: 8,
          padding: "8px 10px",
          fontSize: 13,
          resize: "vertical",
          fontFamily: "inherit",
          boxSizing: "border-box",
        }}
      />
    </div>
  );
}

// ─── Survey Modal ─────────────────────────────────────────────────────────────

function SurveyModal({ survey, category, onClose }) {
  const questions = QUESTION_SETS[survey.qType] || [];
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const answered = Object.keys(answers).filter((k) => answers[k] !== undefined && answers[k] !== "").length;
  const progress = Math.round((answered / questions.length) * 100);

  const setAnswer = (i, val) => setAnswers((prev) => ({ ...prev, [i]: val }));

  const handleSubmit = async () => {
  try {
    await fetch("https://survey-system-backend-x9wk.onrender.com/api/responses/category", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        surveyName: survey.name,
        category: category.name,
        answers: answers,
      }),
    });
  } catch (err) {
    console.error("Failed to save:", err);
  }
  setSubmitted(true);
  setTimeout(() => {
    onClose();
    window.location.href = "/builder";
  }, 2000);
};

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "1rem",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          width: "100%",
          maxWidth: 520,
          maxHeight: "85vh",
          overflowY: "auto",
          padding: "1.5rem",
          boxShadow: "0 8px 40px rgba(0,0,0,0.15)",
        }}
      >
        {!submitted ? (
          <>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>{survey.name}</h2>
                <p style={{ fontSize: 13, color: "#666", marginTop: 3 }}>
                  {category.icon} {category.name} feedback survey
                </p>
              </div>
              <button
                onClick={onClose}
                style={{ border: "1px solid #e0e0e0", background: "transparent", borderRadius: 6, width: 28, height: 28, cursor: "pointer", fontSize: 14, color: "#666" }}
              >
                ✕
              </button>
            </div>

            {/* Progress bar */}
            <div style={{ background: "#f0f0f0", borderRadius: 4, height: 4, marginBottom: 20, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${progress}%`, background: "#185FA5", borderRadius: 4, transition: "width 0.3s" }} />
            </div>

            {/* Questions */}
            {questions.map((q, i) => {
              if (q.type === "rating") return <RatingQuestion key={i} question={q} index={i} value={answers[i]} onChange={(v) => setAnswer(i, v)} />;
              if (q.type === "radio") return <RadioQuestion key={i} question={q} index={i} value={answers[i]} onChange={(v) => setAnswer(i, v)} />;
              if (q.type === "text") return <TextQuestion key={i} question={q} index={i} value={answers[i]} onChange={(v) => setAnswer(i, v)} />;
              return null;
            })}

            <button
              onClick={handleSubmit}
              style={{ width: "100%", padding: "10px", background: "#185FA5", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", marginTop: 8 }}
            >
              Submit Feedback
            </button>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "2rem 1rem" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#EAF3DE", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem", fontSize: 28 }}>
              ✓
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Thank you!</h3>
            <p style={{ fontSize: 14, color: "#666", marginBottom: 24 }}>Your feedback has been submitted successfully.</p>
            <button
              onClick={onClose}
              style={{ padding: "8px 24px", background: "#185FA5", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: "pointer" }}
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function SurveyCategories({ user }) {
  const [selectedCat, setSelectedCat] = useState(null);
  const [activeSurvey, setActiveSurvey] = useState(null);

  const category = CATEGORIES.find((c) => c.id === selectedCat);

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "1.5rem 1rem" }}>
      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>
            Welcome back, <span style={{ color: "#185FA5" }}>{user?.name || "User"}</span> 👋
          </h1>
          <p style={{ fontSize: 13, color: "#666", marginTop: 4 }}>Choose a survey category to share your feedback</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#f5f5f5", border: "1px solid #e8e8e8", borderRadius: 20, padding: "6px 14px 6px 8px", fontSize: 13, color: "#555" }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#B5D4F4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, color: "#0C447C" }}>
            {(user?.name || "U").slice(0, 2).toUpperCase()}
          </div>
          {user?.name || "My Account"}
        </div>
      </div>

      {/* Section label */}
      <p style={{ fontSize: 12, fontWeight: 600, color: "#999", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 12 }}>
        Survey Categories
      </p>

      {/* Category grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12, marginBottom: 24 }}>
        {CATEGORIES.map((cat) => (
          <div
            key={cat.id}
            onClick={() => setSelectedCat(cat.id)}
            style={{
              background: selectedCat === cat.id ? "#E6F1FB" : "#fff",
              border: `${selectedCat === cat.id ? "2px solid #185FA5" : "1px solid #e8e8e8"}`,
              borderRadius: 12,
              padding: "1rem",
              cursor: "pointer",
              position: "relative",
              transition: "border-color 0.15s, transform 0.1s",
            }}
          >
            <span style={{ position: "absolute", top: 10, right: 10, fontSize: 11, color: "#888", background: "#f5f5f5", border: "1px solid #eee", borderRadius: 10, padding: "2px 7px" }}>
              {cat.surveys.length}
            </span>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: cat.iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, marginBottom: 10 }}>
              {cat.icon}
            </div>
            <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{cat.name}</p>
            <p style={{ fontSize: 12, color: "#777", lineHeight: 1.4 }}>{cat.desc}</p>
          </div>
        ))}
      </div>

      {/* Surveys panel – shown when a category is selected */}
      {category && (
        <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: 12, padding: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid #f0f0f0" }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>
              {category.icon} {category.name} Surveys
            </h2>
            <Tag label={`${category.surveys.length} available`} variant="blue" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
            {category.surveys.map((survey, i) => (
              <div
                key={i}
                style={{ border: "1px solid #e8e8e8", borderRadius: 8, padding: 12 }}
              >
                <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{survey.name}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                  <Tag label={survey.tag} variant={survey.tagClass} />
                  <span style={{ fontSize: 12, color: "#888" }}>• {QUESTION_SETS[survey.qType].length} questions</span>
                </div>
                <button
                  onClick={() => setActiveSurvey({ survey, category })}
                  style={{ width: "100%", padding: "7px", border: "1px solid #ddd", borderRadius: 6, background: "transparent", fontSize: 12, fontWeight: 500, color: "#185FA5", cursor: "pointer" }}
                >
                  Start Survey ↗
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Survey modal */}
      {activeSurvey && (
        <SurveyModal
          survey={activeSurvey.survey}
          category={activeSurvey.category}
          onClose={() => setActiveSurvey(null)}
        />
      )}
    </div>
  );
}