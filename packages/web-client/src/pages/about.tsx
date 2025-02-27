import { NavLink } from "react-router";

export default function About() {
  return (
    <div className="prose">
      <h1 className="">About this app</h1>
      <p>
        <strong>Job Seekr</strong> was born out of a necessity to track job applications and generate reports about them.
      </p>
      <p>
        In Germany (probably as in other countries too), when a person registers as a job seeker,
        they need to report to the Federal Employment Agency every once in a while.
      </p>
      <p>
        This project is open source and follows minimal design. You can run it locally, or use a cloud version.
        I built in in my spare time and would appreciate any <a href="https://buymeacoffee.com/ivan.demchenko" target="_blank">support</a> or <a href="https://github.com/ivan-demchenko/job-seekr-app" target="_blank">contribution</a>.
      </p>
      <h3>Kudos to contributors!</h3>
      <ul>
        <li>
          <a href="https://github.com/souravnub" target="_blank">Sourav Kumar</a>
        </li>
      </ul>
      <p>
        Good luck with your job hunt! You can do it!
      </p>
    </div>
  )
}