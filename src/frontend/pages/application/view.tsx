import { useEffect, useState } from "react";
import { NavLink, useParams } from "react-router";
import AddInterviewForm from "../../components/interview_form";
import { printDate } from "../../../utils";
import type { ApplicationModel } from "../../../models/application";
import type { InterviewListModel } from "../../../models/interviews";
import { InterviewsList } from "../../components/interviews_list";
import { Banner } from "../../components/banner";

export default function ViewApplication() {
  let { id } = useParams();

  const [addingInterview, setAddingInterview] = useState(false);
  const [application, setApplication] = useState<ApplicationModel | null>(null);
  const [interviews, setInterviews] = useState<InterviewListModel>([]);

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
        <div>
          <dl className="def-list">
            <dt>Applied</dt>
            <dd>{printDate(application.application_date)}</dd>
            <dt>Job description</dt>
            <dd>{application.job_description}</dd>
          </dl>
        </div>
      </section>
      <section className="flex gap-2 bg-gray-100 p-2 items-center">
        <span>Set status:</span>
        <button className="btn compact" onClick={() => setStatus('interviews')}>Interviews</button>
        <button className="btn compact" onClick={() => setStatus('no_response')}>No response</button>
        <button className="btn compact" onClick={() => setStatus('rejection')}>Rejection</button>
      </section>
      <section>
        <h3 className="text-center font-bold text-xl m-4">Interviews</h3>
        <div className="my-2">
          <button
            type="submit"
            className="btn green"
            onClick={() => setAddingInterview(true)}
          >
            Add interview
          </button>
        </div>
        {interviews.length === 0
          ? <Banner message="No interviews scheduled yet." />
          : <InterviewsList interviews={interviews} />
        }
      </section>
      {addingInterview && (
        <AddInterviewForm application_id={id!} />
      )}
    </>
  )
}
