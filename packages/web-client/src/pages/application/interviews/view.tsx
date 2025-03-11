import type { InterviewCommentModel } from "@job-seekr/data/validation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { BsFillPinFill } from "react-icons/bs";
import { useParams } from "react-router";
import { Banner } from "../../../components/banner";
import InterviewCommentForm from "../../../components/comment_form";
import {
  addInterviewComment,
  deleteInterviewComment,
  interviewDetailsQueryOptions,
  updateInterviewComment,
} from "../../../lib/api";
import { CaseEmpty, CasePayload } from "../../../lib/case";
import { printDate } from "../../../utils";

const CommentActionNone = () => new CaseEmpty("none" as const);
const CommentActionAdd = () => new CaseEmpty("add" as const);
const CommentActionEdit = (comment: InterviewCommentModel) =>
  new CasePayload("edit" as const, comment);

type CommentAction =
  | ReturnType<typeof CommentActionNone>
  | ReturnType<typeof CommentActionAdd>
  | ReturnType<typeof CommentActionEdit>;

const InterviewView = () => {
  const { interview_id } = useParams();
  const queryClient = useQueryClient();

  const [commentAction, setCommentAction] = useState<CommentAction>(
    CommentActionNone(),
  );
  const [isInterviewCommentFormBusy, setIsInterviewCommentFormBusy] =
    useState(false);

  const interviewQuery = useQuery(interviewDetailsQueryOptions(interview_id!));

  const addCommentMutation = useMutation({
    mutationFn: addInterviewComment,
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: [`interview.${interview_id}`],
      });
      setIsInterviewCommentFormBusy(false);
      setCommentAction(CommentActionNone());
    },
    onError: (error: unknown) => {
      console.error(error);
      setCommentAction(CommentActionNone());
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: deleteInterviewComment,
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: [`interview.${interview_id}`],
      });
    },
    onError: (error: unknown) => {
      console.error(error);
    },
  });

  const updateInterviewMutation = useMutation({
    mutationFn: updateInterviewComment,
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: [`interview.${interview_id}`],
      });
      setIsInterviewCommentFormBusy(false);
      setCommentAction(CommentActionNone());
    },
    onError: (error: unknown) => {
      console.error(error);
    },
  });

  if (interviewQuery.isLoading || !interviewQuery.data) {
    return <div>Loading...</div>;
  }

  if (interviewQuery.error || "error" in interviewQuery.data) {
    return (
      <div>
        Error: <pre>{String(interviewQuery.error)}</pre>
      </div>
    );
  }

  const interview = interviewQuery.data.data;

  return (
    <>
      <section>
        <h1 className="text-center font-bold text-2xl mb-4">
          {interview.topic}
        </h1>

        <dl className="def-list">
          <dt>Interview Date</dt>

          <dd>{printDate(interview.interview_date)}</dd>
          <dt>Topic</dt>
          <dd>{interview.topic}</dd>

          <dt>Participants</dt>
          <dd>{interview.participants}</dd>

          <dt>Prep notes</dt>
          <dd>{interview.prep_notes}</dd>
        </dl>

        <div className="mt-5">
          <h2 className="font-semibold text-lg ">Comments</h2>
        </div>
        <ul className="space-y-2 pl-6 mt-2">
          {interview.comments.length === 0 ? (
            <Banner>No comments added yet</Banner>
          ) : (
            interview.comments.map((comment) => {
              return (
                <li
                  className="relative bg-gray-100 p-3 rounded-md flex justify-between items-center"
                  key={comment.id}
                >
                  <p>{comment.comment}</p>
                  {comment.pinned && (
                    <BsFillPinFill className="absolute -left-6 text-xl text-green-700" />
                  )}
                  <div className="space-x-3">
                    <button
                      className="btn compact red"
                      onClick={() => {
                        deleteCommentMutation.mutate({
                          interviewId: comment.interview_id,
                          commentId: comment.id,
                        });
                      }}
                    >
                      Delete
                    </button>
                    <button
                      className="btn compact grey"
                      onClick={() => {
                        setCommentAction(CommentActionEdit(comment));
                      }}
                    >
                      Edit
                    </button>
                  </div>
                </li>
              );
            })
          )}
        </ul>

        <button
          className="btn green mt-4 mx-auto block"
          onClick={() => {
            setCommentAction(CommentActionAdd());
          }}
        >
          Add comment
        </button>
      </section>

      {commentAction._kind === "add" && (
        <InterviewCommentForm
          mode="add"
          interview_id={interview_id!}
          isBusy={isInterviewCommentFormBusy}
          onSubmit={(formData) => {
            console.log(formData);
            setIsInterviewCommentFormBusy(true);
            addCommentMutation.mutate({ id: interview_id!, json: formData });
          }}
          onCancel={() => {
            setCommentAction(CommentActionNone());
          }}
        />
      )}

      {commentAction._kind === "edit" && (
        <InterviewCommentForm
          mode="edit"
          isBusy={isInterviewCommentFormBusy}
          comment={commentAction._payload}
          onSubmit={(id, formData) => {
            console.log(formData);
            setIsInterviewCommentFormBusy(true);
            updateInterviewMutation.mutate({ id, json: formData });
          }}
          onCancel={() => {
            setCommentAction(CommentActionNone());
          }}
        />
      )}
    </>
  );
};

export default InterviewView;
