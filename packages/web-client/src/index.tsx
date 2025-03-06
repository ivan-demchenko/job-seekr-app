import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Route, Routes } from "react-router";
import MainLayout from './layout/main';
import About from './pages/about';
import ApplicationsList from './pages/application/list';
import NewApplication from './pages/application/new';
import ViewApplication from './pages/application/view';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import InterviewView from './pages/application/interviews/view';

const rootElement = document.getElementById('app')!
const queryClient = new QueryClient()

const root = ReactDOM.createRoot(rootElement)
root.render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index path="/" element={<ApplicationsList />} />
            <Route path="/about" element={<About />} />
            <Route path="application">
              <Route path="view/:id" element={<ViewApplication />} />
              <Route path="new" element={<NewApplication />} />

              <Route path=':application_id/interviews/:interview_id' element={<InterviewView/>}></Route>
            </Route>

          </Route>
        </Routes>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
)