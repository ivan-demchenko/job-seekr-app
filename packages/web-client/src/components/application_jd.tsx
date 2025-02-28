import { useState } from "react";
import { renderMD } from "../utils";
import type { ApplicationModel } from "@job-seekr/data/validation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateApplication } from "../lib/api";

type Props = {
  application: ApplicationModel
}

const SHOW_LIMIT = 200;

export default function ApplicationJobDescription(props: Props) {
  const { application } = props;
  const [jd, setJd] = useState(application.job_description);
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [isBusy, setIsBusy] = useState(false);
  const [isFullJDShown, setIsFullJDShown] = useState(false);

  const queryClient = useQueryClient();
  const updateJDMutation = useMutation(
    {
      mutationFn: updateApplication(application.id),
      onSuccess: async () => {
        queryClient.invalidateQueries({ queryKey: [`application.${application.id}`] });
        setIsBusy(false);
        setMode('view');
      },
      onError: (error: unknown) => {
        console.error(error);
        setIsBusy(false);
        setMode('view');
      },
    }
  )

  if (mode === 'view') {
    const renderedJD = jd.length > SHOW_LIMIT
      ? renderMD(isFullJDShown ? jd : `${jd.slice(0, SHOW_LIMIT)}...`)
      : renderMD(jd);
    return (
      <div>
        <div className="space-x-2">
          <button className="btn compact gray" onClick={() => setMode('edit')}>Edit</button>
          {jd.length > SHOW_LIMIT &&
            <button
              className="btn compact"
              onClick={() => setIsFullJDShown(prev => !prev)}
            >
              {isFullJDShown ? 'View less' : "View more"}
            </button>}
        </div>

        <div
          className="formatted-html"
          dangerouslySetInnerHTML={{ __html: renderedJD }}
        />
      </div>
    )
  }

  if (mode === 'edit') {
    return (
      <>
        <div className="form-input">
          <textarea
            value={jd}
            disabled={isBusy}
            onChange={e => setJd(e.target.value)} />
          <div className="mt-2 flex gap-2">
            <button
              className="btn compact green"
              disabled={isBusy}
              onClick={() => {
                updateJDMutation.mutate({
                  target: 'job_description',
                  job_description: jd
                })
              }}
            >
              Save
            </button>
            <button
              className="btn compact gray"
              disabled={isBusy}
              onClick={() => {
                setMode('view');
                setJd(application.job_description)
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </>
    )
  }

}