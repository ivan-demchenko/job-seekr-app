import type { InterviewModel } from "@job-seekr/data/validation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useParams } from "react-router";
import ApplicationJobDescription from "../../components/application_jd";
import ApplicationStatusPanel from "../../components/application_status_panel";
import { Banner } from "../../components/banner";
import InterviewForm from "../../components/interview_form";
import { InterviewsList } from "../../components/interviews_list";
import { Spinner } from "../../components/spinner";
import {
  addInterview,
  applicationDetailsQueryOptions,
  updateInterview,
} from "../../lib/api";
import { CaseEmpty, CasePayload } from "../../lib/case";
import { printDate } from "../../utils";

const InterviewActionNone = () => new CaseEmpty("none" as const);
const InterviewActionAdd = () => new CaseEmpty("add" as const);
const InterviewActionEdit = (interview: InterviewModel) =>
  new CasePayload("edit" as const, interview);

type InterviewAction =
  | ReturnType<typeof InterviewActionNone>
  | ReturnType<typeof InterviewActionAdd>
  | ReturnType<typeof InterviewActionEdit>;

export default function ViewApplication() {
  const { id } = useParams() as { id: string };

  const [interviewAction, setInterviewAction] = useState<InterviewAction>(
    InterviewActionNone(),
  );
  const [isInterviewFormBusy, setIsInterviewFormBusy] = useState(false);

  const queryClient = useQueryClient();
  const pageDataQuery = useQuery(applicationDetailsQueryOptions(id));

  const addInterviewMutation = useMutation({
    mutationFn: addInterview,
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: [`application.${id}`] });
      setIsInterviewFormBusy(false);
      setInterviewAction(InterviewActionNone());
    },
    onError: (error: unknown) => {
      console.error(error);
      setIsInterviewFormBusy(false);
      setInterviewAction(InterviewActionNone());
    },
  });

  const updateInterviewMutation = useMutation({
    mutationFn: updateInterview,
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: [`application.${id}`] });
      setIsInterviewFormBusy(false);
      setInterviewAction(InterviewActionNone());
    },
    onError: (error: unknown) => {
      console.error(error);
      setIsInterviewFormBusy(false);
      setInterviewAction(InterviewActionNone());
    },
  });

  if (pageDataQuery.isLoading || !pageDataQuery.data) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner />
      </div>
    );
  }

  if (pageDataQuery.error || "error" in pageDataQuery.data) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Banner type="error">
          <strong>Error:</strong> <pre>{String(pageDataQuery.error)}</pre>
        </Banner>
      </div>
    );
  }

  const { application, interviews } = pageDataQuery.data.data;

  return (
    <>
      <section>
        <h1 className="text-center font-bold text-2xl mb-4">
          {application.position} @ {application.company}
        </h1>
        <ApplicationStatusPanel application={application} />
        <dl className="def-list">
          <dt className="font-semibold">Applied</dt>
          <dd className="mb-2">{printDate(application.application_date)}</dd>
          <dt className="font-semibold">Job posting URL</dt>
          <dd className="mb-2">
            <a
              href={application.job_posting_url}
              target="_blank"
              rel="noreferrer"
              className="text-blue-500 hover:underline"
            >
              View on {new URL(application.job_posting_url).host}
            </a>
          </dd>
          <dt className="font-semibold">Job description</dt>
          <dd>
            <ApplicationJobDescription application={application} />
          </dd>
        </dl>
      </section>
      <section>
        <h3 className="text-center font-bold text-xl m-4">Interviews</h3>
        {interviews.length === 0 ? (
          <Banner>No interviews scheduled yet</Banner>
        ) : (
          <InterviewsList
            interviews={interviews}
            onEdit={(interview) => {
              setInterviewAction(InterviewActionEdit(interview));
            }}
          />
        )}
        <div className="my-2 flex flex-col items-center">
          <button
            type="button"
            className="btn green"
            onClick={() => setInterviewAction(InterviewActionAdd())}
          >
            Add Interview
          </button>
        </div>
      </section>
      {interviewAction._kind === "add" && (
        <InterviewForm
          mode="add"
          application_id={id}
          isBusy={isInterviewFormBusy}
          onSubmit={(formData) => {
            setIsInterviewFormBusy(true);
            addInterviewMutation.mutate(formData);
          }}
          onCancel={() => {
            setInterviewAction(InterviewActionNone());
          }}
        />
      )}
      {interviewAction._kind === "edit" && (
        <InterviewForm
          mode="edit"
          isBusy={isInterviewFormBusy}
          interview={interviewAction._payload}
          onSubmit={(id, formData) => {
            setIsInterviewFormBusy(true);
            updateInterviewMutation.mutate({ id, json: formData });
          }}
          onCancel={() => {
            setInterviewAction(InterviewActionNone());
          }}
        />
      )}
    </>
  );
}
