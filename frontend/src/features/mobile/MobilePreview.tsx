import { StatusPill } from "@/src/components/ui/StatusPill";

export function MobilePreview({ type }: { type: "caretaker" | "worker" }) {
  const isCaretaker = type === "caretaker";
  return (
    <div className="mobile-stage">
      <div className="phone-frame">
        <header className="phone-header">
          <div>
            <span>{isCaretaker ? "Good Morning" : "Welcome Back"}</span>
            <strong>{isCaretaker ? "Ahmad Raza" : "Muhammad Asif"}</strong>
            <small>{isCaretaker ? "On Duty · Iqbal Colony" : "Quarter B-22 · Active"}</small>
          </div>
          <div className="phone-avatar">A</div>
        </header>
        <section className="checkin-card">
          <div className="pin-shape" />
          <strong>{isCaretaker ? "CHECK IN" : "CURRENT FLAT"}</strong>
          <span>{isCaretaker ? "Tap to start duty" : "Iqbal Labour Colony"}</span>
        </section>
        <div className="phone-summary">
          {(isCaretaker ? ["5 Complaints", "5 Urgent", "5 Maintenance", "6h Duty"] : ["Rent Paid", "2 Bills", "1 Complaint", "Active"]).map((item) => (
            <div key={item}>
              <strong>{item.split(" ")[0]}</strong>
              <span>{item.split(" ").slice(1).join(" ")}</span>
            </div>
          ))}
        </div>
        <h3>{isCaretaker ? "Urgent Alerts" : "My Services"}</h3>
        {[0, 1, 2].map((index) => (
          <article className="phone-card" key={index}>
            <b>{isCaretaker ? "Water Pipe Burst - Q-12" : ["Rent & Payments", "Utility Bills", "Application Status"][index]}</b>
            <p>{isCaretaker ? "Reported 45 mins ago by Ali Khan" : "View latest status and history"}</p>
            <StatusPill status={index === 2 ? "approved" : "pending"} />
          </article>
        ))}
        <nav className="phone-tabs">
          {["Dashboard", "Complaints", "Attendance", "Profile"].map((item, index) => (
            <span className={index === 0 ? "active" : ""} key={item}>
              {item}
            </span>
          ))}
        </nav>
      </div>
    </div>
  );
}
