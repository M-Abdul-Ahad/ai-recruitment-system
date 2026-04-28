const Companies = () => {
    console.log("ADMIN COMPANIES PAGE");

    const companies = [
        { id: 1, name: "Google", recruiter: "rec@test.com" },
        { id: 2, name: "Amazon", recruiter: "owner@test.com" },
    ];

    return (
        <div style={{ padding: "20px" }}>
            <h1>All Companies</h1>

            <table border="1" cellPadding="10">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Owner</th>
                    </tr>
                </thead>

                <tbody>
                    {companies.map((c) => (
                        <tr key={c.id}>
                            <td>{c.id}</td>
                            <td>{c.name}</td>
                            <td>{c.recruiter}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Companies;