import { Link } from "react-router-dom";

const Jobs = () => {
    console.log("PAGE LOADED: Jobs");

    const jobs = [
        { id: 1, title: "Frontend Developer" },
        { id: 2, title: "Backend Engineer" },
    ];

    return (
        <div>
            <h1>All Jobs</h1>

            <Link to="/recruiter/jobs/create">➕ Create Job</Link>

            <ul>
                {jobs.map((job) => (
                    <li key={job.id}>
                        <Link to={`/recruiter/jobs/${job.id}`}>
                            {job.title}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Jobs;