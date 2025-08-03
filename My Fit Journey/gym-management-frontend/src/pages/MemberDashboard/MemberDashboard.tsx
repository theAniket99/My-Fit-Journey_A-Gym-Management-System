import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import api from "../../services/api";
import "./MemberDashboard.css";

interface ClassSession {
  id: number;
  className: string;
  description?: string;
  scheduledAt: string; // ISO date string
  maxCapacity?: number | null;
  trainerId: number;
  trainerName?: string;
}

interface ClassBooking {
  bookingId: number;
  classSessionId: number;
  className: string;
  scheduledAt: string; // ISO date string
  active: boolean;
  bookedAt: string | null;
  present?: boolean; // optional attendance flag
}

interface Plan {
  id: number;
  name: string;
  description?: string;
  price: number;
  durationInDays: number;
  active: boolean;
}

interface UserPlanBooking {
  bookingId: number;
  planId: number;
  planName: string;
  bookingDate: string; // ISO date string
  paymentCompleted: boolean;
  paymentReference?: string;
  active: boolean;
}

const MemberDashboard: React.FC = () => {
  // Classes
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [classBookings, setClassBookings] = useState<ClassBooking[]>([]);

  // Plans
  const [plans, setPlans] = useState<Plan[]>([]);
  const [planBookings, setPlanBookings] = useState<UserPlanBooking[]>([]);

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();

  // Helpers
  const formatDateTime = (isoString: string | null | undefined) => {
    if (!isoString) return "-";
    return new Date(isoString).toLocaleString();
  };

  // Separate active and cancelled bookings for classes and plans
  const activeClassBookings = classBookings.filter((b) => b.active);
  const cancelledClassBookings = classBookings.filter((b) => !b.active);
  const activePlanBookings = planBookings.filter((b) => b.active);
  const cancelledPlanBookings = planBookings.filter((b) => !b.active);

  // Fetch all relevant data for the dashboard
  const fetchData = () => {
    setLoading(true);
    Promise.all([
      api.get<ClassSession[]>("/api/member/classes/available"),
      api.get<ClassBooking[]>("/api/member/classes/bookings"),
      api.get<Plan[]>("/api/plans"),
      api.get<UserPlanBooking[]>("/api/member/bookings"),
    ])
      .then(([classesRes, classBookingsRes, plansRes, planBookingsRes]) => {
        setClasses(classesRes.data);
        setClassBookings(classBookingsRes.data);
        setPlans(plansRes.data.filter((plan) => plan.active)); // only active plans here
        setPlanBookings(planBookingsRes.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load dashboard data.");
        setLoading(false);
      });
  };

  // Initial and updated data fetches triggered by success (action) changes
  useEffect(() => {
    fetchData();
  }, [success]);

  // Logout handler
  const handleLogout = () => {
    sessionStorage.removeItem('jwtToken');
    navigate('/login');
  };

  // Handlers to book and cancel class bookings
  const handleBookClass = async (classSessionId: number) => {
    setSuccess(null);
    setError(null);
    try {
      await api.post("/api/member/classes/book", { classSessionId });
      setSuccess("Class booked successfully!");
    } catch (e: any) {
      const msg = e.response?.data?.message || e.message || "Booking failed.";
      setError(msg);
    }
  };

  const handleCancelClassBooking = async (bookingId: number) => {
    setSuccess(null);
    setError(null);
    try {
      await api.delete(`/api/member/classes/bookings/${bookingId}`);
      setSuccess("Class booking cancelled successfully.");
      // Refresh bookings after cancellation
      const updated = await api.get<ClassBooking[]>("/api/member/classes/bookings");
      setClassBookings(updated.data);
    } catch {
      setError("Failed to cancel booking.");
    }
  };

  // Handlers to book and cancel plan subscriptions
  const handleBookPlan = async (planId: number) => {
    setSuccess(null);
    setError(null);
    try {
      await api.post("/api/member/bookings/book", { planId });
      setSuccess("Plan booked successfully!");
    } catch (e: any) {
      const msg = e.response?.data?.message || e.message || "Plan booking failed.";
      setError(msg);
    }
  };

  const handleCancelPlanBooking = async (bookingId: number) => {
    setSuccess(null);
    setError(null);
    try {
      await api.delete(`/api/member/bookings/${bookingId}`);
      setSuccess("Subscription cancelled successfully.");
      // Refresh plan bookings after cancellation
      const updated = await api.get<UserPlanBooking[]>("/api/member/bookings");
      setPlanBookings(updated.data);
    } catch {
      setError("Failed to cancel subscription.");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="member-dashboard">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1>Welcome to your Member Dashboard</h1>
        <button
          onClick={handleLogout}
          style={{
            padding: '8px 16px',
            backgroundColor: '#dc3545',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          Logout
        </button>
      </header>

      {success && <div className="success">{success}</div>}
      {error && <div className="error">{error}</div>}

      {/* Classes Section */}
      <section>
        <h2>Available Classes</h2>
        {classes.length === 0 ? (
          <p>No available classes for booking at this time.</p>
        ) : (
          <ul className="class-list">
            {classes.map((cls) => (
              <li key={cls.id} className="class-card">
                <h3>{cls.className}</h3>
                <p>{cls.description || "-"}</p>
                <p>
                  Scheduled At: {formatDateTime(cls.scheduledAt)}
                  <br />
                  Trainer: {cls.trainerName || "Unknown"}
                  <br />
                  Max Capacity: {cls.maxCapacity ?? "-"}
                </p>
                <button onClick={() => handleBookClass(cls.id)}>Book This Class</button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2>Your Active Class Bookings</h2>
        {activeClassBookings.length === 0 ? (
          <p>You currently have no active class bookings.</p>
        ) : (
          <ul className="booking-list">
            {activeClassBookings.map((booking) => (
              <li key={booking.bookingId} className="booking-card">
                <strong>{booking.className}</strong> — Scheduled At: {formatDateTime(booking.scheduledAt)}
                <br />
                Booked On: {formatDateTime(booking.bookedAt)}
                <br />
                Status: Active
                <br />
                <button onClick={() => handleCancelClassBooking(booking.bookingId)} className="cancel-btn">
                  Cancel Booking
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2>Class Booking History</h2>
        {cancelledClassBookings.length === 0 ? (
          <p>No cancelled class bookings.</p>
        ) : (
          <ul className="booking-list">
            {cancelledClassBookings.map((booking) => (
              <li key={booking.bookingId} className="booking-card cancelled">
                <strong>{booking.className}</strong> — Scheduled At: {formatDateTime(booking.scheduledAt)}
                <br />
                Booked On: {formatDateTime(booking.bookedAt)}
                <br />
                Status: Cancelled
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Membership Plans Section */}
      <section style={{ marginTop: "2rem" }}>
        <h2>Available Membership Plans</h2>
        {plans.length === 0 ? (
          <p>No active plans available for subscription.</p>
        ) : (
          <ul className="plan-list">
            {plans.map((plan) => (
              <li key={plan.id} className="plan-card">
                <h3>{plan.name}</h3>
                <p>{plan.description || "-"}</p>
                <p>
                  Price: ₹{plan.price}
                  <br />
                  Duration: {plan.durationInDays} day{plan.durationInDays > 1 ? "s" : ""}
                </p>
                <button onClick={() => handleBookPlan(plan.id)}>Subscribe to This Plan</button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
  <h2>Your Active Membership Subscriptions</h2>
  {activePlanBookings.length === 0 ? (
    <p>You currently have no active subscriptions.</p>
  ) : (
    <ul className="plan-booking-list">
      {activePlanBookings.map((booking) => {
        // Find matching plan to get duration
        const plan = plans.find((p) => p.id === booking.planId);
        const duration = plan?.durationInDays || 0;

        // Calculate remaining days
        const bookingDate = new Date(booking.bookingDate);
        const expiryDate = new Date(bookingDate);
        expiryDate.setDate(expiryDate.getDate() + duration);

        const today = new Date();
        const totalDays = duration;
        const daysLeft = Math.max(0, Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
        const usedDays = totalDays - daysLeft;
        const progressPercent = Math.min(100, (usedDays / totalDays) * 100);

        return (
          <li key={booking.bookingId} className="plan-booking-card">
            <strong>{booking.planName}</strong> — Booked On: {formatDateTime(booking.bookingDate)}
            <br />
            Payment Status: {booking.paymentCompleted ? "Completed" : "Pending"}
            {booking.paymentReference && (
              <>
                <br />
                Payment Reference: {booking.paymentReference}
              </>
            )}
            <br />
            Status: Active
            <br />
            <div className="progress-container">
              <div className="progress-bar" style={{ width: `${progressPercent}%` }}></div>
            </div>
            <small>
              {daysLeft} day{daysLeft !== 1 ? "s" : ""} remaining of {totalDays} days
            </small>
            <br />
            <button onClick={() => handleCancelPlanBooking(booking.bookingId)} className="cancel-btn">
              Cancel Subscription
            </button>
          </li>
        );
      })}
    </ul>
  )}
</section>


      <section>
        <h2>Membership Subscription History</h2>
        {cancelledPlanBookings.length === 0 ? (
          <p>No cancelled subscriptions.</p>
        ) : (
          <ul className="plan-booking-list">
            {cancelledPlanBookings.map((booking) => (
              <li key={booking.bookingId} className="plan-booking-card cancelled">
                <strong>{booking.planName}</strong> — Booked On: {formatDateTime(booking.bookingDate)}
                <br />
                Payment Status: {booking.paymentCompleted ? "Completed" : "Pending"}
                {booking.paymentReference && (
                  <>
                    <br />
                    Payment Reference: {booking.paymentReference}
                  </>
                )}
                <br />
                Status: Cancelled
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default MemberDashboard;
