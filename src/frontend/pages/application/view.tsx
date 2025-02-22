import { useEffect, useState } from "react";
import { NavLink, useParams } from "react-router";
import AddInterviewForm from "../../components/interview_form";
import { printDate, renderMD } from "../../../utils";
import { InterviewsList } from "../../components/interviews_list";
import { Banner } from "../../components/banner";
import { applicationSelectSchema, interviewSelectSchema, type ApplicationSelectModel, type InterviewModel } from "../../../drivers/schemas";
import { z } from "zod";

const decoder = z.object({
  data: z.object({
    application: applicationSelectSchema,
    interviews: z.array(interviewSelectSchema)
  })
});

export default function ViewApplication() {
  let { id } = useParams();

  const [addingInterview, setAddingInterview] = useState(false);
  const [application, setApplication] = useState<ApplicationSelectModel | null>(null);
  const [interviews, setInterviews] = useState<InterviewModel[]>([]);
  const [isEditingJD, setIsEditingJD] = useState(false);
  const [newJD, setNewJD] = useState('');

  useEffect(() => {
    async function fetchApplication() {
      const resp = await fetch(`/api/applications/${id}`, {
        headers: { 'Accept': 'application/json' }
      });
      const raw = await resp.json();
      const parsed = decoder.safeParse(raw);
      if (parsed.success) {
        const { application, interviews } = parsed.data.data
        setApplication(application);
        setNewJD(application.job_description)
        setInterviews(interviews)
      }
    }
    fetchApplication();
  }, []);

  async function saveNewJD(newJD: string) {
    const resp = await fetch(`/api/applications/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        target: 'job_description',
        job_description: newJD
      })
    });
    const data = await resp.json();
    if (data.data.ok) {
      setIsEditingJD(false);
      setApplication({
        ...application!,
        job_description: newJD
      });
      alert('Updated!');
    }
  }

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
        <h1 className="text-center font-bold text-2xl mb-4">
          {application.position} @ {application.company}
        </h1>
        <div>
          <dl className="def-list">
            <dt>Applied</dt>
            <dd>{printDate(application.application_date)}</dd>
            <dt className="inline-flex gap-1">
              <span>Job description</span>
              {isEditingJD
                ? <>
                  <button className="text-green-600 text-sm" onClick={() => saveNewJD(newJD)}>Save</button>
                  <button className="text-gray-600 text-sm" onClick={() => setIsEditingJD(false)}>Cancel</button>
                </>
                : <button className="text-blue-600 text-sm" onClick={() => setIsEditingJD(true)}>Edit</button>
              }
            </dt>
            {isEditingJD
              ? <dd className="form-input">
                <textarea value={newJD} onChange={e => setNewJD(e.target.value)}></textarea>
              </dd>
              : <dd className="formatted-html" dangerouslySetInnerHTML={{ __html: renderMD(application.job_description) }} />
            }
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
        <AddInterviewForm
          application_id={id!}
          onInterviewAdded={interview => {
            setAddingInterview(false);
            setInterviews(oldRecs => {
              return [...oldRecs, interview].sort((a, b) => a.interview_date - b.interview_date)
            })
          }}
          onCancel={() => {
            setAddingInterview(false);
          }}
        />
      )}
    </>
  )
}
