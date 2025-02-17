export default function About() {
  return (
    <>
      <h1 className="mb-8 text-center text-3xl">About this app</h1>
      <p className="mb-4">
        Job-Seekr was born out of a necessity to track job applications and generate a report about it.
        In Germany (probably as in other countries too), when a person registers as a job seeker,
        they need to report to the Agency every once in a while.
      </p>
      <p className="mb-4">
        This app design specifically to work locally (to avoid any concerns about data privacy), be open source and minimal.
        I built in in my spare time and would appreciate any <a href="https://buymeacoffee.com/ivan.demchenko" target="_blank" className="text-blue-700">support</a> or <a href="https://github.com/ivan-demchenko/job-seekr-app" target="_blank" className="text-blue-700">contribution</a>.
      </p>
      <p className="mb-4">
        Good luck with your job hunt! You can do it!
      </p>
    </>
  )
}