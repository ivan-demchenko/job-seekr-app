import { useState, type FormEvent } from "react";
import { dateToTimestamp } from "../../utils";
import type { InterviewModel } from "../../domain/validation.schemas";

/**
 * This is because of the date input below.
 * I'll let it do it's thing without interfering, but will convert
 * the input into a timestamp just before sending the form.
 */
type FormInterviewModel = Omit<InterviewModel, 'id' | 'interview_date'> & { interview_date: string };

type AddInterviewForm = {
  application_id: string,
  onInterviewAdded: (interview: InterviewModel) => void
  onCancel: () => void
}

export default function AddInterviewForm(props: AddInterviewForm) {
  const [form, setForm] = useState<FormInterviewModel>({
    application_id: props.application_id,
    interview_date: '',
    prep_notes: '',
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
      const data: { data: InterviewModel } = await resp.json();
      props.onInterviewAdded(data.data);
      setIsBusy(false);
    } catch {
      setIsBusy(false);
    }
  }

  return (
    <form className="m-8 p-8 rounded-xl shadow-xl" onSubmit={handleSubmit}>
      <h1 className="text-center font-bold text-2xl mb-4">Add interview</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="form-input">
          <label htmlFor="interview_date">When</label>
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
          <label htmlFor="topic">Topic</label>
          <input disabled={isBusy} type="text" name="topic" value={form.topic} onChange={e => setForm(oldForm => ({
            ...oldForm,
            topic: e.target.value
          }))} />
        </div>
        <div className="form-input">
          <label htmlFor="participants">Participants</label>
          <textarea disabled={isBusy} name="participants" value={form.participants} onChange={e => setForm(oldForm => ({
            ...oldForm,
            participants: e.target.value
          }))}></textarea>
        </div>
        <div className="form-input">
          <label htmlFor="participants">Any prep notes?</label>
          <textarea
            disabled={isBusy}
            name="prep_notes"
            value={form.prep_notes}
            onChange={e => setForm(oldForm => ({ ...oldForm, prep_notes: e.target.value }))}></textarea>
        </div>
      </div>
      <div className="form-actions">
        <button disabled={isBusy} type="submit" className="btn green">Add interview</button>
        <button disabled={isBusy} onClick={() => props.onCancel()} className="btn gray">Cancel</button>
      </div>
    </form>
  )
}