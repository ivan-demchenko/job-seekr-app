import { useState, type FormEvent } from "react";
import { NavLink, useNavigate } from "react-router";
import type { InterviewModel } from "../../../models/interviews";

type FormInterviewModel = Omit<InterviewModel, 'id'>;

export default function AddInterviewForm(props: { application_id: string }) {
  let navigate = useNavigate();
  const [form, setForm] = useState<FormInterviewModel>({
    application_id: props.application_id,
    interview_date: new Date().toISOString(),
    topic: '',
    participants: ''
  });

  const [isBusy, setIsBusy] = useState(false);
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsBusy(true);
    try {
      const resp = await fetch('/api/interviews', {
        method: 'POST',
        body: JSON.stringify(form)
      });
      const data = resp.json();
      navigate('/');
    } catch {
      setIsBusy(false);
    }
  }

  return (
    <form className="m-8 p-8 rounded-xl shadow-xl" onSubmit={handleSubmit}>
      <h1 className="text-center font-bold text-2xl mb-4">Add interview</h1>
      <div className="form-input">
        <label>When</label>
        <input
          disabled={isBusy}
          type="datetime-local"
          name="interview_date"
          value={form.interview_date}
          onChange={e => setForm(oldForm => {
            console.log(e.target.value);
            return {
              ...oldForm,
              [e.target.name]: e.target.value
            };
          })}
        />
      </div>
      <div className="form-input">
        <label>Topic</label>
        <input disabled={isBusy} type="text" name="topic" value={form.topic} onChange={e => setForm(oldForm => ({
          ...oldForm,
          [e.target.name]: e.target.value
        }))} />
      </div>
      <div className="form-input">
        <label>Participants</label>
        <textarea disabled={isBusy} name="participants" value={form.participants} onChange={e => setForm(oldForm => ({
          ...oldForm,
          [e.target.name]: e.target.value
        }))}></textarea>
      </div>
      <div className="form-actions">
        <button disabled={isBusy} type="submit" className="btn green">Add</button>
        <NavLink to="/" className="btn gray">Back</NavLink>
      </div>
    </form>
  )
}