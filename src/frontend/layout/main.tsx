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
      <header className="flex gap-4 p-4 items-center justify-between">
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

      <main className="px-4">
        <Outlet />
      </main>

      <footer className="p-4">
        All data stored locally
      </footer>
    </>
  );
}