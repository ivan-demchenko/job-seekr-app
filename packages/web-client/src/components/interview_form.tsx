import { useState } from "react";
import { dateToTimestamp, timestampToISO } from "../utils";
import type { InterviewModel, NewInterviewModel } from "@job-seekr/data/validation";

type AddInterviewProps = {
  mode: 'add'
  application_id: string
  isBusy: boolean
  onSubmit: (interview: NewInterviewModel) => void
  onCancel: () => void
}

type EditInterviewProps = {
  mode: 'edit',
  isBusy: boolean
  interview: InterviewModel
  onSubmit: (id: string, interview: NewInterviewModel) => void
  onCancel: () => void
}

type InterviewFormProps = AddInterviewProps | EditInterviewProps;

type FormState =
  Omit<NewInterviewModel, 'interview_date'> & { interview_date: string };

const getInitialFormState = (props: InterviewFormProps): FormState => {
  if (props.mode === 'add') {
    return {
      application_id: props.application_id,
      interview_date: '',
      topic: '',
      participants: '',
      prep_notes: '',
    };
  }
  return {
    ...props.interview,
    interview_date: timestampToISO(props.interview.interview_date),
  };
}

function formStateToOutput(form: FormState): NewInterviewModel {
  return {
    ...form,
    interview_date: dateToTimestamp(form.interview_date),
  }
}

export default function InterviewForm(props: InterviewFormProps) {
  const [form, setForm] = useState<FormState>(
    getInitialFormState(props)
  );

  return (
    <form className="m-8 p-8 rounded-xl shadow-xl" onSubmit={(e) => {
      e.preventDefault();
      props.mode === 'add'
        ? props.onSubmit(formStateToOutput(form))
        : props.onSubmit(props.interview.id, formStateToOutput(form))
    }}>
      <h1 className="text-center font-bold text-2xl mb-4">
        {props.mode === 'add'
          ? `Add interview`
          : `Edit "${props.interview.topic}" interview`
        }
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="form-input">
          <label htmlFor="interview_date">When</label>
          <input
            disabled={props.isBusy}
            type="datetime-local"
            name="interview_date"
            value={form.interview_date}
            onChange={e => {
              setForm(oldForm => {
                return {
                  ...oldForm,
                  interview_date: e.target.value
                };
              })
            }}
          />
        </div>
        <div className="form-input">
          <label htmlFor="topic">Topic</label>
          <input disabled={props.isBusy} type="text" name="topic" value={form.topic} onChange={e => setForm(oldForm => ({
            ...oldForm,
            topic: e.target.value
          }))} />
        </div>
        <div className="form-input">
          <label htmlFor="participants">Participants</label>
          <textarea disabled={props.isBusy} name="participants" value={form.participants} onChange={e => setForm(oldForm => ({
            ...oldForm,
            participants: e.target.value
          }))}></textarea>
        </div>
        <div className="form-input">
          <label htmlFor="participants">Any prep notes?</label>
          <textarea
            disabled={props.isBusy}
            name="prep_notes"
            value={form.prep_notes}
            onChange={e => setForm(oldForm => ({ ...oldForm, prep_notes: e.target.value }))}></textarea>
        </div>
      </div>
      <div className="form-actions">
        <button disabled={props.isBusy} type="submit" className="btn green">
          {props.mode === 'add' ? `Add interview` : `Save changes`}
        </button>
        <button disabled={props.isBusy} onClick={() => props.onCancel()} className="btn gray">Cancel</button>
      </div>
    </form>
  )
}