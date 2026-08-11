const CandidateDetail = () => {
    console.log("PAGE LOADED: Candidate Detail");

    return (
        <div>
            <h1>Candidate Detail</h1>

            <p>Name: John Doe</p>
            <p>Score: 85</p>

            <h3>AI Insights</h3>
            <p>Strong in React, lacks backend experience.</p>

            <button>Shortlist</button>
            <button>Send Email</button>
        </div>
    );
};

export default CandidateDetail;