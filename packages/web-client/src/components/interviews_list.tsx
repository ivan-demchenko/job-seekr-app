import type { InterviewModel } from "@job-seekr/data/validation"
import { printDateTime, renderMD } from "../utils"
import { useNavigate } from "react-router"

type Props = {
  interviews: InterviewModel[];
  onEdit: (interview: InterviewModel) => void;
};

export function InterviewsList(props: Props) {
  const navigate = useNavigate();
  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>When</th>
          <th>Topic</th>
          <th>Participants</th>
          <th>Prep notes</th>
          <th />
        </tr>
      </thead>
      <tbody>
        {props.interviews.map((interview) => {
          return (
            <tr key={interview.id} onClick={() => {
              navigate(`/application/${interview.application_id}/interviews/${interview.id}`);
            }}>
              <td>{printDateTime(interview.interview_date)}</td>
              <td>{interview.topic}</td>
              <td className="formatted-html" dangerouslySetInnerHTML={{ __html: renderMD(interview.participants) }} />
              <td className="formatted-html" dangerouslySetInnerHTML={{ __html: renderMD(interview.prep_notes) }} />
              <td >
                <button className="btn compact gray" onClick={(e) => {
                  e.stopPropagation();
                  props.onEdit(interview)
                }}>Edit</button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
