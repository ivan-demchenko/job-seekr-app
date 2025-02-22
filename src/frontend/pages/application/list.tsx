import { NavLink, useNavigate } from "react-router";
import { printDate } from "../../../utils";
import { Banner } from "../../components/banner";
import { useHTTP } from "../../lib/useHttp";
import { z } from "zod";
import { applicationWithInterviewSchema } from "../../../domain/validation.schemas";

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
    case 'Idle': return <Banner>Loading...</Banner>;
    case 'Loading': return <Banner>Loading...</Banner>;
    case 'Error': {
      switch (state._payload._kind) {
        case 'Unauthenticated': {
          return <Banner type="warning">You need to <a href="/auth/login">login</a>.</Banner>
        }
        case 'BadResponse': return <Banner type="warning">Sorry, the app is missbehaving</Banner>
        case 'NetworkError': return <Banner type="warning">Looks like the connection is unstable</Banner>
      }
    }
    case 'Ready': {
      const applications = state._payload.data;
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
}