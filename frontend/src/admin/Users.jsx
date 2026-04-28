const Users = () => {
    console.log("ADMIN USERS PAGE");

    const users = [
        { id: 1, email: "user1@test.com", role: "applicant" },
        { id: 2, email: "rec@test.com", role: "recruiter" },
        { id: 3, email: "hr@test.com", role: "recruiter (HR)" },
    ];

    return (
        <div style={{ padding: "20px" }}>
            <h1>All Users</h1>

            <table border="1" cellPadding="10">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Email</th>
                        <th>Role</th>
                    </tr>
                </thead>

                <tbody>
                    {users.map((u) => (
                        <tr key={u.id}>
                            <td>{u.id}</td>
                            <td>{u.email}</td>
                            <td>{u.role}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Users;