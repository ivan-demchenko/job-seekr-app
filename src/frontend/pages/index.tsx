import { useEffect, useState } from "react";
import { NavLink } from "react-router";
import type { ApplicationsReadListModel } from "../../models/application";

export default function Index() {
  const [applications, setApplications] = useState<ApplicationsReadListModel>([]);
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
  return (
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
              <td>{new Date(app.application_date).toLocaleDateString()}</td>
              <td>{app.interviewsCount}</td>
              <td>{app.status}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}