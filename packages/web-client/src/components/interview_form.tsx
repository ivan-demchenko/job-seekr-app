import { useState } from "react";
import { timestampToISO } from "../utils";
import type { InterviewModel, InterviewClientModel } from "@job-seekr/data/validation";

/**
 * This is because of the date input below.
 * I'll let it do it's thing without interfering, but will convert
 * the input into a timestamp just before sending the form.
 */
export type InterviewFormModel = Omit<InterviewClientModel, 'interview_date'> & {
  interview_date: string
};

type InterviewFormProps = {
  application_id: string,
  isBusy: boolean,
  onSubmit: (interview: InterviewFormModel) => void
  onCancel: () => void
} & (
    { mode: 'edit', interview: InterviewModel } | { mode: 'add', }
  )

export default function InterviewForm(props: InterviewFormProps) {
  const [form, setForm] = useState<InterviewFormModel>(
    props.mode === 'add'
      ? {
        application_id: props.application_id,
        interview_date: '',
        prep_notes: '',
        topic: '',
        participants: '',
      }
      : {
        ...props.interview,
        interview_date: timestampToISO(props.interview.interview_date),
      }
  );

  return (
    <form className="m-8 p-8 rounded-xl shadow-xl" onSubmit={(e) => {
      e.preventDefault();
      props.onSubmit(form);
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