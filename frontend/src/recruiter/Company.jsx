import { useContext } from "react";
import { AuthContext } from "../auth/AuthContext";

const Company = () => {
  const { user } = useContext(AuthContext);

  console.log("PAGE LOADED: Company Management");

  const hrMembers = [
    { id: 1, email: "hr1@example.com", name: "Sarah Jenkins", role: "HR Manager" },
    { id: 2, email: "hr2@example.com", name: "Alex Rivera", role: "Technical Recruiter" },
  ];

  return (
    <div className="apl-animate-fade max-w-5xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#22241B] dark:text-[#EBF0DA] tracking-tight">
          Company & HR Management
        </h1>
        <p className="text-xs sm:text-sm text-[#8A8F76] dark:text-[#9CA485] mt-1">
          Manage your organization profile, hiring team members, and recruitment permissions
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Company Info */}
        <div className="apl-card md:col-span-1 space-y-4">
          <div className="flex items-center gap-3 border-b border-[#ECEEDF] dark:border-[#2A2E1E] pb-4">
            <div className="w-12 h-12 rounded-xl bg-[#D4DE95] text-[#3D4127] font-extrabold text-xl flex items-center justify-center shadow-xs">
              DC
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#22241B] dark:text-[#EBF0DA]">Demo Company</h3>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#4E7A33]/15 text-[#4E7A33]">
                Verified Account
              </span>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[#8A8F76] font-semibold uppercase tracking-wider block text-[10px]">Industry</span>
              <span className="font-bold text-[#22241B] dark:text-[#EBF0DA]">Technology / SaaS</span>
            </div>
            <div>
              <span className="text-[#8A8F76] font-semibold uppercase tracking-wider block text-[10px]">Account Owner</span>
              <span className="font-bold text-[#22241B] dark:text-[#EBF0DA]">{user?.email ?? "recruiter@example.com"}</span>
            </div>
          </div>
        </div>

        {/* Card 2: HR Team Members */}
        <div className="apl-card md:col-span-2 space-y-5">
          <div className="flex items-center justify-between border-b border-[#ECEEDF] dark:border-[#2A2E1E] pb-4">
            <div>
              <h3 className="text-lg font-extrabold text-[#22241B] dark:text-[#EBF0DA]">HR Team Members</h3>
              <p className="text-xs text-[#8A8F76]">Invite recruiters and team members to collaborate</p>
            </div>
            <button className="apl-btn apl-btn-primary py-2 px-4 text-xs shadow-xs">
              + Add HR Member
            </button>
          </div>

          <div className="divide-y divide-[#ECEEDF] dark:divide-[#2A2E1E]">
            {hrMembers.map((hr) => (
              <div key={hr.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#3D4127] text-[#D4DE95] font-bold text-xs flex items-center justify-center">
                    {hr.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#22241B] dark:text-[#EBF0DA]">{hr.name}</h4>
                    <p className="text-xs text-[#8A8F76]">{hr.email}</p>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#ECEEDF] dark:bg-[#2A2E1E] text-[#52564A] dark:text-[#9CA485]">
                  {hr.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Company;