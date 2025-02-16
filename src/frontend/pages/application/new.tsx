import { useState, type FormEvent } from "react";
import { NavLink, useNavigate } from "react-router";

export default function NewApplication() {
  let navigate = useNavigate();
  const [form, setForm] = useState<{
    company: string,
    position: string,
    job_description: string,
  }>({
    company: '',
    position: '',
    job_description: ''
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
    <form className="m-8 p-8 rounded-xl shadow-xl" onSubmit={handleSubmit}>
      <h1 className="text-center font-bold text-2xl mb-4">New Application</h1>
      <div className="form-input">
        <label>Company name</label>
        <input disabled={isBusy} type="text" name="company" value={form.company} onChange={e => setForm(oldForm => ({
          ...oldForm,
          [e.target.name]: e.target.value.trim()
        }))} />
      </div>
      <div className="form-input">
        <label>Position</label>
        <input disabled={isBusy} type="text" name="position" value={form.position} onChange={e => setForm(oldForm => ({
          ...oldForm,
          [e.target.name]: e.target.value.trim()
        }))} />
      </div>
      <div className="form-input">
        <label>Job description</label>
        <textarea disabled={isBusy} name="job_description" value={form.job_description} onChange={e => setForm(oldForm => ({
          ...oldForm,
          [e.target.name]: e.target.value.trim()
        }))}></textarea>
      </div>
      <div className="form-actions">
        <button disabled={isBusy} type="submit" className="btn green">Add</button>
        <NavLink to="/" className="btn gray">Back</NavLink>
      </div>
    </form>
  )
}