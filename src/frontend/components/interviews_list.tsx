import type { InterviewModel } from "../../domain/validation.schemas"
import { printDateTime, renderMD } from "../../utils"

type Props = {
  interviews: InterviewModel[]
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
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}