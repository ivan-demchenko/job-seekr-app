import { NavLink, useNavigate } from "react-router";
import { printDate } from "../../utils";
import { Banner } from "../../components/banner";
import { useQuery } from '@tanstack/react-query'
import { applicationsListQueryOptions } from "../../lib/api";

export default function Index() {
  const navigate = useNavigate();

  const query = useQuery(applicationsListQueryOptions);

  if (query.isLoading) {
    return <Banner>Loading...</Banner>;
  }

  if (query.data && 'error' in query.data) {
    return <Banner type="warning">Sorry, the app is missbehaving</Banner>
  }

  if (query.data?.data) {
    const applications = query.data.data;
    if (applications.length === 0) {
      return (
        <div className="flex flex-col items-center">
          <h1 className="text-2xl font-bold text-center">Applications</h1>
          <Banner>No applications in here yet. Add your first one!</Banner>
          <NavLink to="/application/new" className="btn green">Add application</NavLink>
        </div>
      )
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
                <tr key={app.id} onClick={() => {
                  navigate(`/application/view/${app.id}`);
                }}>
                  <td className="font-bold">
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
}