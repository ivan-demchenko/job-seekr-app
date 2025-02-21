import { NavLink, useNavigate } from "react-router";
import { printDate } from "../../utils";
import { Banner } from "../components/banner";
import { applicationWithInterviewSchema } from "../../drivers/schemas";
import { useHTTP } from "../lib/useHttp";
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
  }
}