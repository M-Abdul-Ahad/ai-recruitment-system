import { useContext, useState } from "react";
import { AuthContext } from "../auth/AuthContext";

const ResumeBuilder = () => {
    const { user } = useContext(AuthContext);

    const [formData, setFormData] = useState({
        role: "",
        skills: "",
    });

    console.log("PAGE LOADED: Resume Builder");
    console.log("CURRENT USER:", user);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleGenerate = () => {
        console.log("GENERATE RESUME WITH:", formData);
    };

    return (
        <div>
            <h1>AI Resume Builder</h1>

            <input
                type="text"
                name="role"
                placeholder="Target Role"
                value={formData.role}
                onChange={handleChange}
            />

            <br /><br />

            <textarea
                name="skills"
                placeholder="Enter your skills"
                value={formData.skills}
                onChange={handleChange}
            />

            <br /><br />

            <button onClick={handleGenerate}>Generate Resume</button>
        </div>
    );
};

export default ResumeBuilder;