import { useEffect, useState } from "react";
import { useParams } from "react-router";
import AddInterviewForm from "../../components/interview_form";
import { printDate, renderMD } from "../../../utils";
import { InterviewsList } from "../../components/interviews_list";
import { Banner } from "../../components/banner";
import { applicationSelectSchema, interviewSelectSchema, type ApplicationSelectModel, type InterviewModel } from "../../../drivers/schemas";
import { z } from "zod";
import ApplicationStatusPanel from "../../components/application_status_panel";
import ApplicationJobDescription from "../../components/application_jd";

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

  async function fetchApplication() {
    const resp = await fetch(`/api/applications/${id}`, {
      headers: { 'Accept': 'application/json' }
    });
    const raw = await resp.json();
    const parsed = decoder.safeParse(raw);
    if (parsed.success) {
      const { application, interviews } = parsed.data.data
      setApplication(application);
      setInterviews(interviews)
    }
  }

  useEffect(() => {
    fetchApplication();
  }, []);

  if (!application) {
    return <div>Loading...</div>
  }

  return (
    <>
      <section>
        <h1 className="text-center font-bold text-2xl mb-4">
          {application.position} @ {application.company}
        </h1>
        <ApplicationStatusPanel application={application} />
        <dl className="def-list">
          <dt>Applied</dt>
          <dd>{printDate(application.application_date)}</dd>
          <dt>Job description</dt>
          <dd>
            <ApplicationJobDescription
              application={application}
              onSave={() => {
                fetchApplication();
              }}
            />
          </dd>
        </dl>
      </section>
      <section>
        <h3 className="text-center font-bold text-xl m-4">Interviews</h3>
        {interviews.length === 0
          ? <Banner>No interviews scheduled yet</Banner>
          : <InterviewsList interviews={interviews} />
        }
        <div className="my-2 flex flex-col items-center">
          <button
            type="submit"
            className="btn green"
            onClick={() => setAddingInterview(true)}
          >
            Add interview
          </button>
        </div>
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
