import { NavLink, Outlet } from "react-router";

export default function MainLayout() {
  const handleExport = async () => {
    const resp = await fetch('/api/export');
    const data = await resp.json();
    if (data.done) {
      return alert(`Done! The file name is ${data.done}`);
    }
    return alert(`Something went wrong...`);
  }
  return (
    <>
      <header className="flex gap-4 p-4 items-center justify-between container px-4">
        <h3 className="font-bold">Application tracker</h3>
        <div className="flex gap-2">
          <NavLink
            to="/application/new"
            className="btn green"
          >
            Add application
          </NavLink>
          <button className="btn green" onClick={handleExport}>
            Export PDF
          </button>
        </div>
      </header>

      <main className="px-4 container flex-1 overflow-auto">
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