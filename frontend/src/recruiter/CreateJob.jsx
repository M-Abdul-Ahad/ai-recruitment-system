import { useState } from "react";

const CreateJob = () => {
    const [title, setTitle] = useState("");
    const [jd, setJd] = useState("");

    console.log("PAGE LOADED: Create Job");

    const generateJD = () => {
        console.log("Generating JD with AI...");
        setJd("AI Generated Job Description...");
    };

    const handleSubmit = () => {
        console.log("Creating Job:", { title, jd });
    };

    return (
        <div>
            <h1>Create Job</h1>

            <input
                placeholder="Job Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />

            <br /><br />

            <button onClick={generateJD}>Generate JD (AI)</button>

            <br /><br />

            <textarea
                placeholder="Job Description"
                value={jd}
                onChange={(e) => setJd(e.target.value)}
            />

            <br /><br />

            <button onClick={handleSubmit}>Save Job</button>
        </div>
    );
};

export default CreateJob;