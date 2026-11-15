"use client";

import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";

type Exam = {
  id: string;
  code: string;
  name: string;
  language: string;
  levels: { id: string; code: string; name: string; overview: string }[];
};

const weekdays = [
  { label: "Mon", value: 1 }, { label: "Tue", value: 2 }, { label: "Wed", value: 3 },
  { label: "Thu", value: 4 }, { label: "Fri", value: 5 }, { label: "Sat", value: 6 }, { label: "Sun", value: 0 },
];

const proficiencyOptions = [
  { value: "beginner", label: "New to this level", detail: "Start with foundations and a diagnostic." },
  { value: "elementary", label: "Building the basics", detail: "I know some core vocabulary and structures." },
  { value: "intermediate", label: "Working independently", detail: "I can handle familiar exam-level material." },
  { value: "advanced", label: "Refining performance", detail: "I need focused practice and timed review." },
];

export function OnboardingWizard({ initialValues }: {
  initialValues: {
    examLevelId?: string;
    examDate?: string;
    dailyMinutes?: string;
    proficiency?: string;
    preferredDays?: number[];
    schedulePreference?: string;
  };
}) {
  const router = useRouter();
  const [exams, setExams] = useState<Exam[]>([]);
  const [step, setStep] = useState(0);
  const [language, setLanguage] = useState("");
  const [examId, setExamId] = useState("");
  const [levelId, setLevelId] = useState(initialValues.examLevelId ?? "");
  const [proficiency, setProficiency] = useState(initialValues.proficiency ?? "beginner");
  const [examDate, setExamDate] = useState(initialValues.examDate ?? "");
  const [minutes, setMinutes] = useState(Number(initialValues.dailyMinutes) || 30);
  const [days, setDays] = useState(initialValues.preferredDays?.length ? initialValues.preferredDays : [1, 2, 3, 4, 5]);
  const [schedulePreference, setSchedulePreference] = useState(initialValues.schedulePreference ?? "flexible");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch("/api/exams")
      .then(async (response) => {
        if (!response.ok) throw new Error("Could not load exam programs.");
        return response.json() as Promise<Exam[]>;
      })
      .then((data) => {
        if (!active) return;
        setExams(data);
        const initialExam = data.find((exam) => exam.levels.some((level) => level.id === initialValues.examLevelId));
        if (initialExam) {
          setExamId(initialExam.id);
          setLanguage(initialExam.language);
        } else if (data[0]) {
          setExamId(data[0].id);
          setLanguage(data[0].language);
        }
      })
      .catch((caught: unknown) => setError(caught instanceof Error ? caught.message : "Could not load exam programs."))
      .finally(() => setLoading(false));
    return () => { active = false; };
  }, [initialValues.examLevelId]);

  const languages = useMemo(() => [...new Set(exams.map((exam) => exam.language))], [exams]);
  const languageExams = exams.filter((exam) => exam.language === language);
  const activeExam = exams.find((exam) => exam.id === examId);
  const activeLevel = activeExam?.levels.find((level) => level.id === levelId);

  function selectLanguage(value: string) {
    setLanguage(value);
    const nextExam = exams.find((exam) => exam.language === value);
    setExamId(nextExam?.id ?? "");
    setLevelId(nextExam?.levels[0]?.id ?? "");
  }

  function selectExam(value: string) {
    const nextExam = exams.find((exam) => exam.id === value);
    setExamId(value);
    if (!nextExam?.levels.some((level) => level.id === levelId)) setLevelId(nextExam?.levels[0]?.id ?? "");
  }

  function toggleDay(value: number) {
    setDays((current) => current.includes(value) ? current.filter((day) => day !== value) : [...current, value]);
  }

  function nextStep() {
    setError("");
    if (step === 0 && !language) return setError("Choose a language first.");
    if (step === 1 && !examId) return setError("Choose an examination.");
    if (step === 2 && !levelId) return setError("Choose a target level.");
    if (step === 3 && !proficiency) return setError("Choose your current proficiency.");
    if (step === 4 && !examDate) return setError("Choose your target exam date.");
    if (step === 5 && days.length === 0) return setError("Choose at least one study day.");
    setStep((current) => Math.min(6, current + 1));
  }

  async function createPlan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examLevelId: levelId,
          currentProficiency: proficiency,
          examDate,
          dailyStudyMinutes: minutes,
          preferredDays: days,
          schedulePreference,
        }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Could not generate your plan.");
      router.replace("/dashboard");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not generate your plan.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <div className="wizard" aria-live="polite">Loading examination programs…</div>;

  return (
    <form className="wizard" onSubmit={createPlan}>
      <p className="small-copy">Personalize your study plan</p>
      <h1>{step === 6 ? "Your plan is ready to generate" : ["Choose a language", "Choose an exam", "Set your target level", "Tell us where you are now", "Choose your exam date", "Set your study rhythm"][step]}</h1>
      <div className="wizard-progress" aria-label={`Step ${step + 1} of 7`}>
        <span style={{ width: `${((step + 1) / 7) * 100}%` }} />
      </div>

      {step === 0 && (
        <div className="wizard-grid">
          {languages.map((item) => (
            <label className="wizard-choice" key={item}>
              <input type="radio" name="language" value={item} checked={language === item} onChange={() => selectLanguage(item)} />
              <span><strong>{item}</strong><p>Certification preparation available</p></span>
            </label>
          ))}
        </div>
      )}
      {step === 1 && (
        <div className="wizard-grid">
          {languageExams.map((exam) => (
            <label className="wizard-choice" key={exam.id}>
              <input type="radio" name="exam" value={exam.id} checked={examId === exam.id} onChange={() => selectExam(exam.id)} />
              <span><strong>{exam.code}</strong><p>{exam.name}</p></span>
            </label>
          ))}
        </div>
      )}
      {step === 2 && (
        <div className="wizard-grid">
          {activeExam?.levels.map((level) => (
            <label className="wizard-choice" key={level.id}>
              <input type="radio" name="level" value={level.id} checked={levelId === level.id} onChange={() => setLevelId(level.id)} />
              <span><strong>{level.code}</strong><p>{level.overview}</p></span>
            </label>
          ))}
        </div>
      )}
      {step === 3 && (
        <div className="wizard-grid">
          {proficiencyOptions.map((option) => (
            <label className="wizard-choice" key={option.value}>
              <input type="radio" name="proficiency" value={option.value} checked={proficiency === option.value} onChange={() => setProficiency(option.value)} />
              <span><strong>{option.label}</strong><p>{option.detail}</p></span>
            </label>
          ))}
        </div>
      )}
      {step === 4 && (
        <div className="field onboarding-field">
          <label htmlFor="exam-date">Target examination date</label>
          <input id="exam-date" type="date" value={examDate} onChange={(event) => setExamDate(event.target.value)} required />
          <p className="form-hint">Choose a date within the next two years. You can update it later.</p>
        </div>
      )}
      {step === 5 && (
        <div className="content-stack">
          <div className="field">
            <label htmlFor="minutes">Available study time each day</label>
            <select id="minutes" value={minutes} onChange={(event) => setMinutes(Number(event.target.value))}>
              {[20, 30, 45, 60, 90, 120, 180].map((value) => <option key={value} value={value}>{value} minutes</option>)}
            </select>
          </div>
          <fieldset className="day-picker">
            <legend>Days you can study</legend>
            <div className="day-options">
              {weekdays.map((day) => (
                <label className={days.includes(day.value) ? "day-option selected" : "day-option"} key={day.value}>
                  <input type="checkbox" checked={days.includes(day.value)} onChange={() => toggleDay(day.value)} />
                  <span>{day.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="field">
            <label htmlFor="schedule">Preferred study time</label>
            <select id="schedule" value={schedulePreference} onChange={(event) => setSchedulePreference(event.target.value)}>
              <option value="morning">Morning</option>
              <option value="afternoon">Afternoon</option>
              <option value="evening">Evening</option>
              <option value="flexible">Flexible</option>
            </select>
          </div>
        </div>
      )}
      {step === 6 && (
        <div className="plan-summary">
          <p><strong>Examination</strong><span>{activeExam?.code} · {activeLevel?.code}</span></p>
          <p><strong>Current proficiency</strong><span>{proficiencyOptions.find((item) => item.value === proficiency)?.label}</span></p>
          <p><strong>Target date</strong><span>{examDate}</span></p>
          <p><strong>Study time</strong><span>{minutes} minutes on {days.length} days each week</span></p>
          <p className="form-hint">The plan will begin with a diagnostic and foundations, then move through section practice, timed work and final review.</p>
        </div>
      )}

      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="wizard-controls">
        {step > 0
          ? <button className="button button-secondary" type="button" onClick={() => { setError(""); setStep((current) => current - 1); }}><ArrowLeft size={17} /> Back</button>
          : <span />}
        {step < 6
          ? <button className="button" type="button" onClick={nextStep}>Continue <ArrowRight size={17} /></button>
          : <button className="button" type="submit" disabled={busy}>{busy ? "Building your plan…" : <>Generate my plan <Check size={17} /></>}</button>}
      </div>
    </form>
  );
}
