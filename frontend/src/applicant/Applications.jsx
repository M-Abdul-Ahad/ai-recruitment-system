import { useContext } from "react";
import { AuthContext } from "../auth/AuthContext";

const Applications = () => {
    const { user } = useContext(AuthContext);

    console.log("PAGE LOADED: Applications Page");
    console.log("CURRENT USER:", user);

    return (
        <div>
            <h1>Your Applications</h1>
            <p>Track your job applications here.</p>

            <ul>
                <li>Google - Pending</li>
                <li>Amazon - Reviewed</li>
                <li>Microsoft - Rejected</li>
            </ul>
        </div>
    );
};

export default Applications;