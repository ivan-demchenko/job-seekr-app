import type { InterviewListModel } from "../../models/interviews"
import { printDate } from "../../utils"

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
              <td>{printDate(interview.interview_date)}</td>
              <td>{interview.topic}</td>
              <td>{interview.participants}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}