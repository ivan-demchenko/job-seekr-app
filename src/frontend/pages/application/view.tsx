import { useEffect, useState } from "react";
import { NavLink, useParams } from "react-router";

export default function NewApplication() {
  let { id } = useParams();

  const [addingInterview, setAddingInterview] = useState(false);
  const [application, setApplication] = useState<any>(null);

  useEffect(() => {
    async function fetchApplication() {
      const resp = await fetch(`/api/applications/${id}`, {
        headers: { 'Accept': 'application/json' }
      });
      const data = await resp.json();
      setApplication(data.data);
    }
    fetchApplication();
  }, []);

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
        <button className="btn compact">Interviews</button>
        <button className="btn compact">No response</button>
        <button className="btn compact">Rejection</button>
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
              <tr>
                <td>01.02.2025</td>
                <td>Introduction</td>
                <td>Person 1, Person 2</td>
              </tr>
              <tr>
                <td>01.02.2025</td>
                <td>Introduction</td>
                <td>Person 1, Person 2</td>
              </tr>
              <tr>
                <td>01.02.2025</td>
                <td>Introduction</td>
                <td>Person 1, Person 2</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      {addingInterview && (
        <form className="m-8 p-8 rounded-xl shadow-xl">
          <h1 className="text-center font-bold text-2xl mb-4">Add interview</h1>
          <div className="form-input">
            <label>When</label>
            <input type="datetime-local" />
          </div>
          <div className="form-input">
            <label>Topic</label>
            <input type="text" />
          </div>
          <div className="form-input">
            <label>Participants</label>
            <textarea></textarea>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn green" onClick={() => setAddingInterview(false)}>Add</button>
            <button className="btn gray" onClick={() => setAddingInterview(false)}>Cancel</button>
          </div>
        </form>
      )}
    </>
  )
}
