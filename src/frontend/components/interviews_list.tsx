import type { InterviewListModel } from "../../models/interviews"
import { printDateTime, renderMD } from "../../utils"

type Props = {
  interviews: InterviewListModel
}

export function InterviewsList(props: Props) {
  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>When</th>
          <th>Topic</th>
          <th>Participants</th>
        </tr>
      </thead>
      <tbody>
        {props.interviews.map(interview => {
          return (
            <tr key={interview.id}>
              <td>{printDateTime(interview.interview_date)}</td>
              <td>{interview.topic}</td>
              <td className="formatted-html" dangerouslySetInnerHTML={{ __html: renderMD(interview.participants) }} />
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}