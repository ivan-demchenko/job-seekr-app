import type { NewApplicationModel } from "@job-seekr/data/validation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type FormEvent, useState } from "react";
import { NavLink, useNavigate } from "react-router";
import { saveApplication } from "../../lib/api";
import {
  dateToTimestamp,
  getCurrentTimestamp,
  timestampToISO,
} from "../../utils";

type FormApplicationModel = Omit<NewApplicationModel, "application_date"> & {
  application_date: string;
};

export default function NewApplication() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormApplicationModel>({
    company: "",
    position: "",
    job_description: "",
    job_posting_url: "",
    application_date: timestampToISO(getCurrentTimestamp()),
    status: "applied",
  });
  const [isBusy, setIsBusy] = useState(false);
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: saveApplication,
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      setIsBusy(false);
      navigate("/");
    },
    onError: (error: unknown) => {
      console.error(error);
      setIsBusy(false);
      navigate("/");
    },
  });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsBusy(true);
    mutation.mutate({
      ...form,
      application_date: dateToTimestamp(form.application_date),
    });
  }

  return (
    <>
      <h1 className="text-center font-bold text-2xl">New Application</h1>
      <form
        className="p-8 border border-gray-100 rounded-xl shadow-xl"
        onSubmit={handleSubmit}
      >
        <div className="form-input">
          <label htmlFor="company">Company name</label>
          <input
            disabled={isBusy}
            type="text"
            name="company"
            value={form.company}
            onChange={(e) =>
              setForm((oldForm) => ({
                ...oldForm,
                company: e.target.value,
              }))
            }
          />
        </div>
        <div className="form-input">
          <label htmlFor="position">Position</label>
          <input
            disabled={isBusy}
            type="text"
            name="position"
            value={form.position}
            onChange={(e) =>
              setForm((oldForm) => ({
                ...oldForm,
                position: e.target.value,
              }))
            }
          />
        </div>
        <div className="form-input">
          <label htmlFor="job_posting_url">Job posting url</label>
          <input
            disabled={isBusy}
            type="url"
            name="job_posting_url"
            value={form.job_posting_url}
            onChange={(e) =>
              setForm((oldForm) => ({
                ...oldForm,
                job_posting_url: e.target.value,
              }))
            }
          />
        </div>
        <div className="form-input">
          <label htmlFor="job_description">Job description</label>
          <textarea
            disabled={isBusy}
            name="job_description"
            value={form.job_description}
            onChange={(e) =>
              setForm((oldForm) => ({
                ...oldForm,
                job_description: e.target.value,
              }))
            }
          />
        </div>
        <div className="form-input">
          <label htmlFor="application_date">Application Date</label>
          <input
            disabled={isBusy}
            type="datetime-local"
            name="application_date"
            value={form.application_date}
            onChange={(e) => {
              setForm((oldForm) => {
                return {
                  ...oldForm,
                  application_date: e.target.value,
                };
              });
            }}
          />
        </div>
        <div className="form-actions">
          <button disabled={isBusy} type="submit" className="btn green">
            Add
          </button>
          <NavLink to="/" className="btn gray">
            Back
          </NavLink>
        </div>
      </form>
    </>
  );
}
