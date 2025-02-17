import { useState, type FormEvent } from "react";
import { NavLink, useNavigate } from "react-router";
import type { InterviewModel } from "../../models/interviews";
import { dateToTimestamp } from "../../utils";

/**
 * This is because of the date input below.
 * I'll let it do it's thing without interfering, but will convert
 * the input into a timestamp just before sending the form.
 */
type FormInterviewModel = Omit<InterviewModel, 'id' | 'interview_date'> & { interview_date: string };

export default function AddInterviewForm(props: { application_id: string }) {
  let navigate = useNavigate();
  const [form, setForm] = useState<FormInterviewModel>({
    application_id: props.application_id,
    interview_date: '',
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
        body: JSON.stringify({
          ...form,
          interview_date: dateToTimestamp(form.interview_date)
        })
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
          onChange={e => {
            setForm(oldForm => {
              return {
                ...oldForm,
                interview_date: e.target.value
              };
            })
          }}
        />
      </div>
      <div className="form-input">
        <label>Topic</label>
        <input disabled={isBusy} type="text" name="topic" value={form.topic} onChange={e => setForm(oldForm => ({
          ...oldForm,
          topic: e.target.value
        }))} />
      </div>
      <div className="form-input">
        <label>Participants</label>
        <textarea disabled={isBusy} name="participants" value={form.participants} onChange={e => setForm(oldForm => ({
          ...oldForm,
          participants: e.target.value
        }))}></textarea>
      </div>
      <div className="form-actions">
        <button disabled={isBusy} type="submit" className="btn green">Add</button>
        <NavLink to="/" className="btn gray">Back</NavLink>
      </div>
    </form>
  )
}