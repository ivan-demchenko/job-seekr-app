import { NavLink, Outlet } from "react-router";

export default function MainLayout() {
  return (
    <>
      <header className="flex gap-4 p-4 items-center justify-between">
        <h3 className="font-bold">Application tracker</h3>
        <NavLink
          to="application/new"
          className="btn green"
        >
          Add application
        </NavLink>
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