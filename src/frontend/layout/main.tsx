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
    const data = await resp.json();
    if (data.done) {
      return alert(`Done! The file name is ${data.done}`);
    }
    return alert(`Something went wrong...`);
  }

  if (authStatus.state._kind === 'Loading' || authStatus.state._kind === 'Idle') {
    return <p>Loading...</p>;
  }

  return (
    <>
      <header className="flex gap-4 p-4 items-center justify-between container px-4 border-b border-b-gray-300">
        <h3 className="font-bold">Job Seeks</h3>
        {authStatus.state._kind === 'Error' && (
          <div className="flex gap-2">
            <a href="/auth/login" className="btn green">
              Login
            </a>
          </div>
        )}
        {authStatus.state._kind === 'Ready' && (
          <div className="flex gap-2">
            <NavLink to="/applications" className="btn green">
              My applications
            </NavLink>
            <NavLink to="/application/new" className="btn green">
              Add application
            </NavLink>
            <button className="btn green" onClick={handleExport}>
              Export PDF
            </button>
            <a href="/auth/logout" className="btn green">
              Logout
            </a>
          </div>
        )}
      </header>

      <main className="p-4 container flex-1 overflow-auto">
        <Outlet />
      </main>

      <footer className="page-footer">
        <p>All data gets stored locally. <NavLink to="/about">Read more about this project.</NavLink></p>
        <p className="text-sm">
          Developed by <a href="https://www.linkedin.com/in/ivandemchenko/" target="_blank">Ivan Demchenko</a>
        </p>
        <p className="text-sm">
          <a href="https://github.com/ivan-demchenko/job-seekr-app" target="_blank">View it on GitHub</a> or <a href="https://buymeacoffee.com/ivan.demchenko" target="_blank">support the project</a>
        </p>
      </footer>
    </>
  );
}