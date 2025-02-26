import { useEffect, useState } from "react";
import { useParams } from "react-router";
import InterviewForm, { type InterviewFormModel } from "../../components/interview_form";
import { dateToTimestamp, printDate } from "../../utils";
import { InterviewsList } from "../../components/interviews_list";
import { Banner } from "../../components/banner";
import { z } from "zod";
import ApplicationStatusPanel from "../../components/application_status_panel";
import ApplicationJobDescription from "../../components/application_jd";
import { applicationSelectSchema, interviewSelectSchema, type ApplicationSelectModel, type InterviewModel, type NewInterviewModel, type UpdateInterviewModel } from "@job-seekr/data/validation";
import { CaseEmpty, CasePayload } from "../../lib/case";

const applicationInterviewsPairDecoder = z.object({
  data: z.object({
    application: applicationSelectSchema,
    interviews: z.array(interviewSelectSchema)
  })
});

const interviewDecoder = z.object({
  data: interviewSelectSchema
});

const InterviewActionNone = () => new CaseEmpty('none' as const);
const InterviewActionAdd = () => new CaseEmpty('add' as const);
const InterviewActionEdit = (interview: InterviewModel) => new CasePayload('edit' as const, interview);
type InterviewAction =
  | ReturnType<typeof InterviewActionNone>
  | ReturnType<typeof InterviewActionAdd>
  | ReturnType<typeof InterviewActionEdit>

export default function ViewApplication() {
  let { id } = useParams();

  const [interviewAction, setInterviewAction] = useState<InterviewAction>(InterviewActionNone());
  const [application, setApplication] = useState<ApplicationSelectModel | null>(null);
  const [interviews, setInterviews] = useState<InterviewModel[]>([]);
  const [isInterviewFormBusy, setIsInterviewFormBusy] = useState(false);

  async function fetchApplication() {
    const resp = await fetch(`/api/applications/${id}`, {
      headers: { 'Accept': 'application/json' }
    });
    const raw = await resp.json();
    const parsed = applicationInterviewsPairDecoder.safeParse(raw);
    if (parsed.success) {
      const { application, interviews } = parsed.data.data
      setApplication(application);
      setInterviews(interviews)
    }
  }

  async function addInterview(formData: NewInterviewModel) {
    return await fetch('/api/interviews', {
      method: 'POST',
      body: JSON.stringify(formData)
    });
  }

  async function updateInterview(formData: UpdateInterviewModel) {
    return await fetch(`/api/interviews/${formData.id}`, {
      method: 'PUT',
      body: JSON.stringify(formData)
    });
  }

  async function handleInterviewFormData(formData: InterviewFormModel) {
    setIsInterviewFormBusy(true);
    try {
      const payload = {
        ...formData,
        interview_date: dateToTimestamp(formData.interview_date)
      };
      const resp = interviewAction._kind === 'add'
        ? await addInterview(payload)
        : await updateInterview(payload);

      const rawData = await resp.json();
      setIsInterviewFormBusy(false);
      setInterviewAction(InterviewActionNone())

      const parseResult = interviewDecoder.safeParse(rawData);
      if (!parseResult.success) {
        return setInterviewAction(InterviewActionNone());
      }
      const interview = parseResult.data.data;
      if (interviewAction._kind === 'add') {
        return setInterviews(existingRecs => {
          return [...existingRecs, interview].sort((a, b) => a.interview_date - b.interview_date)
        })
      }
      if (interviewAction._kind === 'edit') {
        return setInterviews(existingRecs =>
          existingRecs.map(rec =>
            rec.id === interviewAction._payload.id
              ? interview
              : rec
          )
        )
      }
    } catch {
      setIsInterviewFormBusy(false);
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
          <dt>Job posting url</dt>
          <dd>
            <a href={application.job_posting_url} target="_blank">
              View on {new URL(application.job_posting_url).host}
            </a>
          </dd>
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
          : <InterviewsList
            interviews={interviews}
            onEdit={interview => {
              setInterviewAction(InterviewActionEdit(interview));
            }}
          />
        }
        <div className="my-2 flex flex-col items-center">
          <button className="btn green" onClick={() => setInterviewAction(InterviewActionAdd())}>
            Add interview
          </button>
        </div>
      </section>
      {interviewAction._kind === 'add' && (
        <InterviewForm
          mode="add"
          application_id={id!}
          isBusy={isInterviewFormBusy}
          onSubmit={handleInterviewFormData}
          onCancel={() => {
            setInterviewAction(InterviewActionNone());
          }}
        />
      )}
      {interviewAction._kind === 'edit' && (
        <InterviewForm
          mode="edit"
          isBusy={isInterviewFormBusy}
          interview={interviewAction._payload}
          application_id={id!}
          onSubmit={handleInterviewFormData}
          onCancel={() => {
            setInterviewAction(InterviewActionNone());
          }}
        />
      )}
    </>
  )
}
