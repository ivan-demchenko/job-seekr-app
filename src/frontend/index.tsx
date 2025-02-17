import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Route, Routes } from "react-router";
import MainLayout from './layout/main';
import About from './pages/about';
import ApplicationsList from './pages/applications-list';
import NewApplication from './pages/application/new';
import ViewApplication from './pages/application/view';

const rootElement = document.getElementById('app')!

const root = ReactDOM.createRoot(rootElement)
root.render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<ApplicationsList />} />
          <Route path="about" element={<About />} />
          <Route path="application">
            <Route path="view/:id" element={<ViewApplication />} />
            <Route path="new" element={<NewApplication />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)