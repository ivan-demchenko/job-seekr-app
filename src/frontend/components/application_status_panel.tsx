import { useState } from "react";
import type { ApplicationSelectModel } from "../../domain/validation.schemas";

type Props = {
  application: ApplicationSelectModel;
}

export default function ApplicationStatusPanel(props: Props) {
  const { application } = props;
  const [currStatus, setCurrStatus] = useState(application.status);
  const [isBusy, setIsBusy] = useState(false);

  async function patchStatus(newStatus: string) {
    if (isBusy) {
      return;
    }
    setIsBusy(true);
    const resp = await fetch(`/api/applications/${application.id}`, {
      method: 'PUT',
      body: JSON.stringify({ target: 'status', status: newStatus })
    });
    if (resp.ok) {
      setIsBusy(false);
      setCurrStatus(newStatus);
      // alert(`New status: ${data.data.status}`);
    }
  }

  const statuses = [
    ['applied', 'Applied'],
    ['interviews', 'Interviews'],
    ['no_response', 'No Response'],
    ['rejection', 'Rejection'],
  ]

  return (
    <section className="flex gap-2 rounded-md bg-gray-100 p-2 mb-2 items-center">
      <span>Set status:</span>
      {statuses.map(([status, label]) => {
        const className = [
          'btn compact',
          status === currStatus ? 'active' : '',
          isBusy ? 'busy' : ''
        ];
        return (
          <button
            key={status}
            className={className.join(' ')}
            onClick={() => patchStatus(status)}
          >
            {label}
          </button>
        )
      })}
    </section>
  )
}