import React, { useEffect, useState } from "react";
import api from "../../services/api";
import "./AdminRevenue.css"; // ✅ New CSS file for styling

interface Trainer {
  id: number;
  username: string;
  fullName: string;
  email: string;
  active: boolean;
}

interface TrainerSalary {
  id: number;
  trainer: Trainer;
  salary: number;
  effectiveFrom: string;
}

interface UserPlanBooking {
  bookingId: number;
  planId: number;
  planName: string;
  bookingDate: string;
  paymentCompleted: boolean;
  paymentReference?: string;
  active: boolean;
  memberName: string;
  memberEmail: string;
  planPrice: number;
}

const AdminRevenue: React.FC = () => {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [trainerSalaries, setTrainerSalaries] = useState<TrainerSalary[]>([]);
  const [userPlanBookings, setUserPlanBookings] = useState<UserPlanBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [salaryEdits, setSalaryEdits] = useState<Map<number, string>>(new Map());

  // Fetch Data
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const trainersRes = await api.get<Trainer[]>("/api/admin/trainers");
      const salariesRes = await api.get<TrainerSalary[]>("/api/admin/trainer-salaries");
      const bookingsRes = await api.get<UserPlanBooking[]>("/api/admin/member-plans");

      setTrainers(trainersRes.data);
      setTrainerSalaries(salariesRes.data);
      setUserPlanBookings(bookingsRes.data);

      const editMap = new Map<number, string>();
      salariesRes.data.forEach(s => editMap.set(s.trainer.id, s.salary.toString()));
      setSalaryEdits(editMap);

      setLoading(false);
    } catch {
      setError("Failed to load revenue related data");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getSalaryForTrainer = (trainerId: number) =>
    trainerSalaries.find(s => s.trainer.id === trainerId) || null;

  const onSalaryChange = (trainerId: number, value: string) => {
    setSalaryEdits(new Map(salaryEdits.set(trainerId, value)));
  };

  const saveSalary = async (trainerId: number) => {
    const salaryStr = salaryEdits.get(trainerId);
    if (!salaryStr) return;
    const salaryNum = parseFloat(salaryStr);
    if (isNaN(salaryNum) || salaryNum < 0) {
      alert("Please enter a valid non-negative number for salary");
      return;
    }
    try {
      await api.post("/api/admin/trainer-salaries", null, { params: { trainerId, salary: salaryNum } });
      fetchData();
    } catch {
      alert("Failed to save salary");
    }
  };

  const deleteUserPlanBooking = async (bookingId: number) => {
    if (!window.confirm("Are you sure you want to remove this plan booking?")) return;
    try {
      await api.delete(`/api/admin/member-plans/${bookingId}`);
      setUserPlanBookings(prev => prev.filter(b => b.bookingId !== bookingId));
    } catch {
      alert("Error deleting plan booking");
    }
  };

  const totalIncome = userPlanBookings.filter(b => b.active).reduce((sum, b) => sum + (b.planPrice || 0), 0);
  const totalSalaries = trainerSalaries.reduce((sum, s) => sum + (s.salary || 0), 0);
  const netProfit = totalIncome - totalSalaries;

  if (loading) return <p className="loading-text">Loading...</p>;
  if (error) return <p className="error-msg">{error}</p>;

  return (
    <div className="revenue-management">
      <h1>Revenue Management</h1>
        {/* KPI Widget Section */}
{/* KPI Widget Section */}
<div className="kpi-widget-container">
  <div className="kpi-card">
    <div className="kpi-icon">💰</div>
    <h3>Total Income</h3>
    <div className="kpi-value kpi-income">₹{totalIncome.toFixed(2)}</div>
  </div>

  <div className="kpi-card">
    <div className="kpi-icon">👨‍🏫</div>
    <h3>Total Salaries</h3>
    <div className="kpi-value kpi-salary">₹{totalSalaries.toFixed(2)}</div>
  </div>

  <div className="kpi-card">
    <div className="kpi-icon">📈</div>
    <h3>Net Profit</h3>
    <div className={`kpi-value ${netProfit >= 0 ? "kpi-profit" : "kpi-loss"}`}>
      ₹{netProfit.toFixed(2)}
    </div>
  </div>
</div>


      {/* Trainer Salaries */}
      <section>
        <h2>Trainer Salaries</h2>
        <table className="styled-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Salary (₹)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {trainers.map(trainer => (
              <tr key={trainer.id}>
                <td>{trainer.fullName}</td>
                <td>{trainer.email}</td>
                <td className={trainer.active ? "status-active" : "status-suspended"}>
                  {trainer.active ? "Active" : "Inactive"}
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    value={salaryEdits.get(trainer.id) || ""}
                    onChange={e => onSalaryChange(trainer.id, e.target.value)}
                  />
                </td>
                <td>
                  <button onClick={() => saveSalary(trainer.id)}>Save</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Member Plan Bookings */}
      <section>
        <h2>Member Plan Bookings</h2>
        <table className="styled-table">
          <thead>
            <tr>
              <th>Member</th>
              <th>Email</th>
              <th>Plan</th>
              <th>Price (₹)</th>
              <th>Booking Date</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {userPlanBookings.length === 0 ? (
              <tr>
                <td colSpan={8}>No bookings found</td>
              </tr>
            ) : (
              userPlanBookings.map(b => (
                <tr key={b.bookingId}>
                  <td>{b.memberName}</td>
                  <td>{b.memberEmail}</td>
                  <td>{b.planName}</td>
                  <td>₹{b.planPrice?.toFixed(2) ?? "N/A"}</td>
                  <td>{new Date(b.bookingDate).toLocaleDateString()}</td>
                  <td className={b.paymentCompleted ? "status-active" : "status-suspended"}>
                    {b.paymentCompleted ? "Completed" : "Pending"}
                  </td>
                  <td className={b.active ? "status-active" : "status-suspended"}>
                    {b.active ? "Active" : "Cancelled"}
                  </td>
                  <td>
                    <button className="delete-btn" onClick={() => deleteUserPlanBooking(b.bookingId)}>Remove</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      {/* Revenue Summary */}
      <section className="revenue-summary">
        <h2>Revenue Summary</h2>
        <p><strong>Total Income:</strong> ₹{totalIncome.toFixed(2)}</p>
        <p><strong>Total Salaries:</strong> ₹{totalSalaries.toFixed(2)}</p>
        <p>
          <strong>Net Profit:</strong>{" "}
          <span className={netProfit >= 0 ? "status-active" : "status-suspended"}>
            ₹{netProfit.toFixed(2)}
          </span>
        </p>
      </section>
    </div>
  );
};

export default AdminRevenue;
