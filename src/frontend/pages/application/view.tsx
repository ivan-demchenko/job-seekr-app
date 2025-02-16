import { useEffect, useState } from "react";
import { NavLink, useParams } from "react-router";
import AddInterviewForm from "./interview_form";

export default function ViewApplication() {
  let { id } = useParams();

  const [addingInterview, setAddingInterview] = useState(false);
  const [application, setApplication] = useState<any>(null);
  const [interviews, setInterviews] = useState<any[]>([]);

  useEffect(() => {
    async function fetchApplication() {
      const resp = await fetch(`/api/applications/${id}`, {
        headers: { 'Accept': 'application/json' }
      });
      const data = await resp.json();
      setApplication(data.data.application);
      setInterviews(data.data.interviews)
    }
    fetchApplication();
  }, []);

  async function setStatus(newStatus: string) {
    const resp = await fetch(`/api/applications/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ target: 'status', status: newStatus })
    });
    const data = await resp.json();
    if (data.data.ok) {
      alert('Updated!');
    }
  }

  if (!application) {
    return <div>Loading...</div>
  }

  return (
    <>
      <section>
        <div className="py-1 px-3 mb-2 bg-gray-100 rounded-xl">
          <NavLink to="/" className="text-blue-500">Back</NavLink>
        </div>
        <h1 className="text-center font-bold text-2xl mb-4">
          {application.position} @ {application.company}
        </h1>
        <div>Applied: {new Date(application.application_date).toLocaleDateString()}</div>
        <div className="form-input">
          <label>Job description</label>
          <span>Lorem ipsum dolor sit amet consectetur adipisicing elit. Veritatis modi libero sapiente suscipit assumenda omnis laboriosam atque, corrupti repudiandae nihil, accusamus quam necessitatibus fugit earum quaerat tenetur. Repellendus, asperiores dignissimos?</span>
        </div>
      </section>
      <section className="flex gap-2 bg-gray-100 p-2 items-center">
        <span>Set status:</span>
        <button className="btn compact" onClick={() => setStatus('interviews')}>Interviews</button>
        <button className="btn compact" onClick={() => setStatus('no_response')}>No response</button>
        <button className="btn compact" onClick={() => setStatus('rejection')}>Rejection</button>
      </section>
      <section>
        <h1 className="text-center font-bold text-2xl mb-4">Interviews</h1>
        <div className="my-2">
          <button
            type="submit"
            className="btn green"
            onClick={() => setAddingInterview(true)}
          >
            Add interview
          </button>
        </div>
        <div>
          <table className="data-table">
            <thead>
              <tr>
                <th>When</th>
                <th>Topic</th>
                <th>Participants</th>
              </tr>
            </thead>
            <tbody>
              {interviews.map(interview => {
                return (
                  <tr key={interview.id}>
                    <td>{new Date(interview.interview_date).toLocaleDateString()}</td>
                    <td>{interview.topic}</td>
                    <td>{interview.participants}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
      {addingInterview && (
        <AddInterviewForm application_id={id!} />
      )}
    </>
  )
}
