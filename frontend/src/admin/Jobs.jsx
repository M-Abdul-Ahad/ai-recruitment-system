const Jobs = () => {
    console.log("ADMIN JOBS PAGE");

    const jobs = [
        { id: 1, title: "Frontend Dev", company: "Google" },
        { id: 2, title: "Backend Dev", company: "Amazon" },
    ];

    return (
        <div style={{ padding: "20px" }}>
            <h1>All Jobs</h1>

            <table border="1" cellPadding="10">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Company</th>
                    </tr>
                </thead>

                <tbody>
                    {jobs.map((j) => (
                        <tr key={j.id}>
                            <td>{j.id}</td>
                            <td>{j.title}</td>
                            <td>{j.company}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Jobs;