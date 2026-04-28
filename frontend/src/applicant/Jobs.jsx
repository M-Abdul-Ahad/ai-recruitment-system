import { useContext } from "react";
import { AuthContext } from "../auth/AuthContext";

const Jobs = () => {
    const { user } = useContext(AuthContext);

    console.log("PAGE LOADED: Jobs Page");
    console.log("CURRENT USER:", user);

    return (
        <div>
            <h1>Job Listings</h1>
            <p>Browse available jobs here.</p>

            <ul>
                <li>Software Engineer</li>
                <li>Data Analyst</li>
                <li>Frontend Developer</li>
            </ul>
        </div>
    );
};

export default Jobs;