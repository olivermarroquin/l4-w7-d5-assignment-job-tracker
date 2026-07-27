import { useState, useEffect } from "react";

function App() {
  const [jobs, setJobs] = useState([]);

  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("Applied");
  const [dateApplied, setDateApplied] = useState("");

  const apiURL = import.meta.env.DEV
    ? import.meta.env.VITE_API_URL_DEV
    : import.meta.env.VITE_API_URL_PROD;

  console.log("apiURL =", JSON.stringify(apiURL));

  async function loadJobs() {
    try {
      const data = await fetch(`${apiURL}/api/jobs`);
      const res = await data.json();

      setJobs(res);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  }

  async function addJob(event) {
    event.preventDefault();

    const newJob = {
      company,
      role,
      status,
      date_applied: dateApplied || null,
    };

    try {
      const data = await fetch(`${apiURL}/api/jobs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newJob),
      });

      const res = await data.json();

      setJobs([res, ...jobs]);

      setCompany("");
      setRole("");
      setStatus("Applied");
      setDateApplied("");
    } catch (error) {
      console.error("Error creating job:", error);
    }
  }

  useEffect(() => {
    loadJobs();
  }, []);

  return (
    <main>
      <h1>Job Tracker</h1>

      <form onSubmit={addJob}>
        <div>
          <label>Company</label>
          <input
            type="text"
            value={company}
            onChange={(event) => setCompany(event.target.value)}
            required
          />
        </div>

        <div>
          <label>Role</label>
          <input
            type="text"
            value={role}
            onChange={(event) => setRole(event.target.value)}
            required
          />
        </div>

        <div>
          <label>Status</label>

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option>Applied</option>
            <option>Interviewing</option>
            <option>Offer</option>
            <option>Rejected</option>
          </select>
        </div>

        <div>
          <label>Date Applied</label>

          <input
            type="date"
            value={dateApplied}
            onChange={(event) => setDateApplied(event.target.value)}
          />
        </div>

        <button type="submit">Add Job</button>
      </form>

      <hr />

      {jobs.length === 0 ? (
        <p>No jobs added yet.</p>
      ) : (
        <ul>
          {jobs.map((job) => (
            <li key={job.id}>
              <strong>{job.company}</strong> - {job.role} - {job.status}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

export default App;
