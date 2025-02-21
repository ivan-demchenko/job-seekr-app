import { useState, type FormEvent } from "react";
import { NavLink, useNavigate } from "react-router";
import { getCurrentTimestamp } from "../../../utils";
import type { ApplicationSelectModel } from "../../../drivers/schemas";

type FormApplicationModel = Omit<ApplicationSelectModel, 'id' | 'user_id'>;

export default function NewApplication() {
  let navigate = useNavigate();
  const [form, setForm] = useState<FormApplicationModel>({
    company: '',
    position: '',
    job_description: '',
    application_date: getCurrentTimestamp(),
    status: 'applied'
  });

  const [isBusy, setIsBusy] = useState(false);
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsBusy(true);
    try {
      const resp = await fetch('/api/applications', {
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
    <>
      <h1 className="text-center font-bold text-2xl">New Application</h1>
      <form className="p-8 border border-gray-100 rounded-xl shadow-xl" onSubmit={handleSubmit}>
        <div className="form-input">
          <label>Company name</label>
          <input disabled={isBusy} type="text" name="company" value={form.company} onChange={e => setForm(oldForm => ({
            ...oldForm,
            [e.target.name]: e.target.value
          }))} />
        </div>
        <div className="form-input">
          <label>Position</label>
          <input disabled={isBusy} type="text" name="position" value={form.position} onChange={e => setForm(oldForm => ({
            ...oldForm,
            [e.target.name]: e.target.value
          }))} />
        </div>
        <div className="form-input">
          <label>Job description</label>
          <textarea disabled={isBusy} name="job_description" value={form.job_description} onChange={e => setForm(oldForm => ({
            ...oldForm,
            [e.target.name]: e.target.value
          }))}></textarea>
        </div>
        <div className="form-actions">
          <button disabled={isBusy} type="submit" className="btn green">Add</button>
          <NavLink to="/" className="btn gray">Back</NavLink>
        </div>
      </form>
    </>
  )
}