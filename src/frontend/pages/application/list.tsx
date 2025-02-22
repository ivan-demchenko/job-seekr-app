import { NavLink, useNavigate } from "react-router";
import { printDate } from "../../../utils";
import { Banner } from "../../components/banner";
import { applicationWithInterviewSchema } from "../../../drivers/schemas";
import { useHTTP } from "../../lib/useHttp";
import { z } from "zod";

const decoder = z.object({
  data: z.array(applicationWithInterviewSchema)
})

export default function Index() {
  const navigate = useNavigate();

  const { state } = useHTTP({
    url: '/api/applications',
    decoder,
    onError: (err) => {
      if (err._kind === 'Unauthenticated') {
        return navigate('/login');
      }
    }
  });

  switch (state._kind) {
    case 'Idle': return <Banner message="Loading..." />;
    case 'Loading': return <Banner message="Loading..." />;
    case 'Error': {
      switch (state._payload._kind) {
        case 'Unauthenticated': {
          return <Banner message="You need to login" />
        }
        case 'BadResponse': return <Banner message="Sorry, the app is missbehaving" />
        case 'NetworkError': return <Banner message="Looks like the connection is unstable" />
      }
    }
    case 'Ready': {
      const applications = state._payload.data;
      if (applications.length === 0) {
        return (
          <div className="flex flex-col items-center">
            <h1 className="text-2xl font-bold text-center">Applications</h1>
            <Banner message="No applications in here yet. Add your first one!" />
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
                <th></th>
              </tr>
            </thead>
            <tbody>
              {applications.map(app => {
                return (
                  <tr key={app.id}>
                    <td className="font-bold">
                      {app.company}
                    </td>
                    <td>{printDate(app.application_date)}</td>
                    <td>{app.interviewsCount}</td>
                    <td>{app.status}</td>
                    <td>
                      <NavLink to={`/application/view/${app.id}`} className="btn compact">
                        View
                      </NavLink>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </>
      )
    }
  }
}