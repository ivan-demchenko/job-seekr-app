import type { InterviewModel } from "@job-seekr/data/validation";
import { printDateTime, renderMD } from "../utils";
import { useNavigate } from "react-router";

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
            // biome-ignore lint/a11y/useKeyWithClickEvents: no need
            <tr
              key={interview.id}
              onClick={() => {
                navigate(
                  `/application/${interview.application_id}/interviews/${interview.id}`,
                );
              }}
            >
              <td>{printDateTime(interview.interview_date)}</td>
              <td>{interview.topic}</td>
              <td
                className="formatted-html"
                // biome-ignore lint/security/noDangerouslySetInnerHtml: sanitised
                dangerouslySetInnerHTML={{
                  __html: renderMD(interview.participants),
                }}
              />
              <td
                className="formatted-html"
                // biome-ignore lint/security/noDangerouslySetInnerHtml: sanitised
                dangerouslySetInnerHTML={{
                  __html: renderMD(interview.prep_notes),
                }}
              />
              <td>
                <button
                  type="button"
                  className="btn compact"
                  onClick={(e) => {
                    e.stopPropagation();
                    props.onEdit(interview);
                  }}
                >
                  Edit
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
