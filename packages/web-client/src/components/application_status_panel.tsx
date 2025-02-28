import { useState } from "react";
import type { ApplicationModel } from "@job-seekr/data/validation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateApplication } from "../lib/api";

type Props = {
  application: ApplicationModel;
}

export default function ApplicationStatusPanel(props: Props) {
  const { application } = props;
  const [isBusy, setIsBusy] = useState(false);

  const queryClient = useQueryClient();
  const updateStatusMutation = useMutation(
    {
      mutationFn: updateApplication(application.id),
      onSuccess: async () => {
        queryClient.invalidateQueries({ queryKey: [`application.${application.id}`] });
        setIsBusy(false);
      },
      onError: (error: unknown) => {
        console.error(error);
        setIsBusy(false);
      },
    }
  )

  const handleNewStatus = (status: string) => {
    setIsBusy(true);
    updateStatusMutation.mutate({ target: 'status', status });
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
          status === application.status ? 'active' : '',
          isBusy ? 'busy' : ''
        ];
        return (
          <button
            key={status}
            className={className.join(' ')}
            onClick={() => handleNewStatus(status)}
          >
            {label}
          </button>
        )
      })}
    </section>
  )
}