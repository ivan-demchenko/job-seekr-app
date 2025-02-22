import { NavLink, Outlet, useNavigate } from "react-router";
import { useHTTP } from "../lib/useHttp";
import { z } from "zod";

const userDecoder = z.object({
  user: z.object({
    name: z.string()
  })
});

export default function MainLayout() {
  const navigate = useNavigate();

  const authStatus = useHTTP({
    url: '/auth/me',
    decoder: userDecoder,
    onError: (err) => {
      if (err._kind === 'Unauthenticated') {
        navigate('/');
      }
    }
  });

  const handleExport = async () => {
    const resp = await fetch('/api/export');
    const rawData = await resp.blob();
    const newBlob = new Blob([rawData]);
    const blobUrl = window.URL.createObjectURL(newBlob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.setAttribute('download', `export-${Date.now()}.pdf`);
    link.click();
    window.URL.revokeObjectURL(blobUrl);
  }

  if (authStatus.state._kind === 'Loading' || authStatus.state._kind === 'Idle') {
    return <p>Loading...</p>;
  }

  return (
    <>
      <aside className="flex flex-col gap-4 p-4 bg-gray-50">
        <div className="flex-1">
          <h3 className="font-bold text-2xl mb-6">Job Seekr</h3>
          {authStatus.state._kind === 'Error' && (
            <div className="flex gap-2">
              <a href="/auth/login" className="btn green">
                Login
              </a>
            </div>
          )}
          {authStatus.state._kind === 'Ready' && (
            <div className="flex flex-col gap-2">
              <NavLink to="/applications" className="btn green">
                My applications
              </NavLink>
              <NavLink to="/application/new" className="btn green">
                Add application
              </NavLink>
              <button className="btn green" onClick={() => handleExport()}>
                Export PDF
              </button>
              <a href="/auth/logout" className="btn green">
                Logout
              </a>
            </div>
          )}
        </div>
        <footer className="page-footer">
          <p><NavLink to="/about">Read more about this project.</NavLink></p>
          <p className="text-sm">
            Developed by <a href="https://www.linkedin.com/in/ivandemchenko/" target="_blank">Ivan Demchenko</a>
          </p>
          <p className="text-sm">
            <a href="https://github.com/ivan-demchenko/job-seekr-app" target="_blank">View it on GitHub</a> or <a href="https://buymeacoffee.com/ivan.demchenko" target="_blank">support the project</a>
          </p>
        </footer>
      </aside>

      <main className="p-4 container flex-1">
        {authStatus.state._kind === 'Error'
          ? <p>Please, <a href="/auth/login">login</a> first</p>
          : <Outlet />
        }
      </main>
    </>
  );
}