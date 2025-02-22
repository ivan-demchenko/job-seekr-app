import { useState, type FormEvent } from "react";
import { NavLink, useNavigate } from "react-router";
import { dateToTimestamp, getCurrentTimestamp, timestampToISO } from "../../../utils";
import type { ApplicationSelectModel } from "../../../drivers/schemas";

type FormApplicationModel = Omit<ApplicationSelectModel, 'id' | 'user_id' | 'application_date'> & { application_date: string };

export default function NewApplication() {
  let navigate = useNavigate();
  const [form, setForm] = useState<FormApplicationModel>({
    company: '',
    position: '',
    job_description: '',
    job_posting_url: '',
    application_date: timestampToISO(getCurrentTimestamp()),
    status: 'applied'
  });

  const [isBusy, setIsBusy] = useState(false);
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsBusy(true);
    try {
      const resp = await fetch('/api/applications', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          application_date: dateToTimestamp(form.application_date)
        })
      });
      const data = resp.json();
      navigate('/');
    } catch {
      setIsBusy(false);
    }
  }

  return (
    <>
      <h1 className="text-center font-bold text-2xl">New Application</h1>
      <form className="p-8 border border-gray-100 rounded-xl shadow-xl" onSubmit={handleSubmit}>
        <div className="form-input">
          <label>Company name</label>
          <input disabled={isBusy} type="text" name="company" value={form.company} onChange={e => setForm(oldForm => ({
            ...oldForm,
            company: e.target.value
          }))} />
        </div>
        <div className="form-input">
          <label>Position</label>
          <input disabled={isBusy} type="text" name="position" value={form.position} onChange={e => setForm(oldForm => ({
            ...oldForm,
            position: e.target.value
          }))} />
        </div>
        <div className="form-input">
          <label>Job posting url</label>
          <input disabled={isBusy} type="url" name="job_posting_url" value={form.job_posting_url} onChange={e => setForm(oldForm => ({
            ...oldForm,
            job_posting_url: e.target.value
          }))} />
        </div>
        <div className="form-input">
          <label>Job description</label>
          <textarea disabled={isBusy} name="job_description" value={form.job_description} onChange={e => setForm(oldForm => ({
            ...oldForm,
            job_description: e.target.value
          }))} />
        </div>
        <div className="form-input">
          <label>Application Date</label>
          <input
            disabled={isBusy}
            type="datetime-local"
            name="application_date"
            value={form.application_date}
            onChange={e => {
              setForm(oldForm => {
                return {
                  ...oldForm,
                  application_date: e.target.value
                };
              })
            }}
          />
        </div>
        <div className="form-actions">
          <button disabled={isBusy} type="submit" className="btn green">Add</button>
          <NavLink to="/" className="btn gray">Back</NavLink>
        </div>
      </form>
    </>
  )
}