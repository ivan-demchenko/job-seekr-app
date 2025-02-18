import { useEffect, useState } from "react";
import { NavLink } from "react-router";
import { printDate } from "../../utils";
import { Banner } from "../components/banner";
import type { ApplicationWithInterviewModel } from "../../drivers/schemas";

export default function Index() {
  const [applications, setApplications] = useState<ApplicationWithInterviewModel[]>([]);

  useEffect(() => {
    async function fetchApplications() {
      const resp = await fetch('/api/applications', {
        headers: { 'Accept': 'application/json' }
      });
      const data = await resp.json();
      setApplications(data.data);
    }
    fetchApplications();
  }, []);

  if (applications.length === 0) {
    return <Banner message="No applications in here yet. Use the green button to add one!" />
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-center">Applications</h1>
      <table className="data-table">
        <thead>
          <tr>
            <th>Company</th>
            <th>When applied</th>
            <th>Interviews</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {applications.map(app => {
            return (
              <tr key={app.id}>
                <td>
                  <NavLink to={`/application/view/${app.id}`}>
                    {app.company}
                  </NavLink>
                </td>
                <td>{printDate(app.application_date)}</td>
                <td>{app.interviewsCount}</td>
                <td>{app.status}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </>
  )
}