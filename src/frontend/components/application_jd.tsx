import { useState } from "react";
import type { ApplicationSelectModel } from "../../drivers/schemas";
import { renderMD } from "../../utils";

type Props = {
  application: ApplicationSelectModel;
  onSave: () => void
}

export default function ApplicationJobDescription(props: Props) {
  const { application, onSave } = props;
  const [jd, setJd] = useState(application.job_description);
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [isBusy, setIsBusy] = useState(false);

  async function patchJD() {
    setIsBusy(true);
    const resp = await fetch(`/api/applications/${application.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        target: 'job_description',
        job_description: jd
      })
    });
    if (resp.ok) {
      setMode('view');
      setIsBusy(false);
      onSave();
    }
  }

  if (mode === 'view') {
    return (
      <div>
        <button className="btn compact gray" onClick={() => setMode('edit')}>Edit</button>
        <div className="formatted-html" dangerouslySetInnerHTML={{ __html: renderMD(jd) }} />
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
              onClick={() => patchJD()}
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