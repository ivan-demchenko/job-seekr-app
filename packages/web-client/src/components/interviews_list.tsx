import type { InterviewModel } from "@job-seekr/data/validation"
import { printDateTime, renderMD } from "../utils"

type Props = {
  interviews: InterviewModel[],
  onEdit: (interview: InterviewModel) => void
}

export function InterviewsList(props: Props) {
  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>When</th>
          <th>Topic</th>
          <th>Participants</th>
          <th>Prep notes</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {props.interviews.map(interview => {
          return (
            <tr key={interview.id}>
              <td>{printDateTime(interview.interview_date)}</td>
              <td>{interview.topic}</td>
              <td className="formatted-html" dangerouslySetInnerHTML={{ __html: renderMD(interview.participants) }} />
              <td className="formatted-html" dangerouslySetInnerHTML={{ __html: renderMD(interview.prep_notes) }} />
              <td>
                <button className="btn compact" onClick={() => props.onEdit(interview)}>Edit</button>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}