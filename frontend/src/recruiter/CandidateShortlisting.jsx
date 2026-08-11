import { useState } from "react";
import { useParams } from "react-router-dom";

const CandidateShortlisting = () => {
    const { jobId } = useParams();

    const [resumes, setResumes] = useState([]);
    const [results, setResults] = useState([]);

    console.log("PAGE LOADED: Candidate Shortlisting");
    console.log("JOB ID:", jobId);

    const handleUpload = (e) => {
        const files = Array.from(e.target.files);
        console.log("Uploaded Resumes:", files);
        setResumes(files);
    };

    const runMatching = () => {
        console.log("Running AI Matching for job:", jobId);

        // Dummy results (replace with API later)
        setResults([
            { id: 1, name: "John Doe", score: 85 },
            { id: 2, name: "Jane Smith", score: 72 },
        ]);
    };

    return (
        <div style={{ padding: "20px" }}>
            <h1>Candidate Shortlisting</h1>

            <p><strong>Job ID:</strong> {jobId}</p>

            <hr />

            {/* Job Description Section */}
            <h3>Job Description</h3>
            <p>Job description will be fetched here...</p>

            <hr />

            {/* Upload Resumes */}
            <h3>Upload Resumes</h3>
            <input type="file" multiple onChange={handleUpload} />

            <p>{resumes.length} file(s) selected</p>

            <hr />

            {/* AI Matching */}
            <h3>AI Resume Matching</h3>
            <button onClick={runMatching}>
                Compare Resumes with JD
            </button>

            <hr />

            {/* Results */}
            <h3>Shortlisted Candidates</h3>

            {results.length === 0 ? (
                <p>No results yet</p>
            ) : (
                <ul>
                    {results.map((r) => (
                        <li key={r.id}>
                            {r.name} — Score: {r.score}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default CandidateShortlisting;