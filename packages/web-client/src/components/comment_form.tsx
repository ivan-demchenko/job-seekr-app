import type {
  InterviewCommentModel,
  NewInterviewCommentModel,
} from "@job-seekr/data/validation";
import React, { useState } from "react";
import { dateToTimestamp, timestampToISO } from "../utils";

type AddInterviewProps = {
  mode: "add";
  interview_id: string;
  isBusy: boolean;
  onSubmit: (interview: NewInterviewCommentModel) => void;
  onCancel: () => void;
};

type EditCommentProps = {
  mode: "edit";
  isBusy: boolean;
  comment: InterviewCommentModel;
  onSubmit: (id: string, interview: NewInterviewCommentModel) => void;
  onCancel: () => void;
};

type CommentFormProps = AddInterviewProps | EditCommentProps;

type FormState = Omit<NewInterviewCommentModel, "comment_date"> & {
  comment_date: string;
};

const getInitialFormState = (props: CommentFormProps): FormState => {
  if (props.mode === "add") {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());

    return {
      comment: "",
      comment_date: now.toISOString().slice(0, 16),
      pinned: false,
    };
  }
  return {
    ...props.comment,
    comment_date: timestampToISO(props.comment.comment_date),
  };
};

function formStateToOutput(form: FormState): NewInterviewCommentModel {
  console.log("inner form", form);
  return {
    ...form,
    comment_date: dateToTimestamp(form.comment_date),
  };
}

const InterviewCommentForm = (props: CommentFormProps) => {
  const [form, setForm] = useState<FormState>(getInitialFormState(props));

  return (
    <form
      className="m-8 p-8 rounded-xl shadow-xl"
      onSubmit={(e) => {
        e.preventDefault();
        props.mode === "add"
          ? props.onSubmit(formStateToOutput(form))
          : props.onSubmit(props.comment.id, formStateToOutput(form));
      }}
    >
      <h1 className="text-center font-bold text-2xl mb-4">
        {props.mode === "add" ? "Add Comment" : "Edit Comment"}
      </h1>
      <div>
        <div>
          <label className="text-sm font-bold text-gray-700" htmlFor="pinned">
            Pinned
          </label>
          <input
            type="checkbox"
            id="pinned"
            name="pinned"
            checked={form.pinned}
            className="ml-2"
            onChange={(e) =>
              setForm((oldForm) => ({ ...oldForm, pinned: e.target.checked }))
            }
          />
        </div>

        <div className="form-input">
          <label htmlFor="participants">Comment</label>
          <textarea
            id="comment"
            disabled={props.isBusy}
            name="comment"
            value={form.comment}
            onChange={(e) =>
              setForm((oldForm) => ({ ...oldForm, comment: e.target.value }))
            }
          />
        </div>
      </div>
      <div className="form-actions">
        <button disabled={props.isBusy} type="submit" className="btn green">
          {props.mode === "add" ? "Add Comment" : "Save changes"}
        </button>
        <button
          disabled={props.isBusy}
          onClick={() => props.onCancel()}
          type="button"
          className="btn gray"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default InterviewCommentForm;
