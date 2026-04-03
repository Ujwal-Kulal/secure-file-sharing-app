// src/HomePage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import {
  ArrowRight,
  BadgePlus,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Hash,
  LogIn,
  Shield,
  Upload,
  UserPlus,
  Users,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../hooks/useAuth";
import "./HomePage.css";

export default function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, user } = useAuth();
  const [activeSlide, setActiveSlide] = useState(0);
  const [appToast, setAppToast] = useState({ type: "", message: "" });
  const [activeServiceSlide, setActiveServiceSlide] = useState(0);
  const [uniqueId, setUniqueId] = useState("");
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState("");
  const [myGroups, setMyGroups] = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const touchStartX = useRef(0);
  const servicesTouchStartX = useRef(0);

  const slides = useMemo(
    () => [
      {
        title: "Share Files With End-to-End Protection",
        subtitle: "Upload once, control access, and track every download with confidence.",
        metric: "AES Encryption",
        tone: "amber",
        hint: "Security",
        image: "/images/hero-slide-1.png",
      },
      {
        title: "Team Spaces Built For Private Collaboration",
        subtitle: "Create focused groups, limit members, and isolate project-level sharing.",
        metric: "Group Access Control",
        tone: "blue",
        hint: "Collaboration",
        image: "/images/hero-slide-2.png",
      },
      {
        title: "Audit-Ready Activity Visibility",
        subtitle: "See who accessed what and when, with clear logs on every shared file.",
        metric: "Live Access Logs",
        tone: "mint",
        hint: "Observability",
        image: "/images/hero-slide-3.png",
      },
    ],
    []
  );

  const services = useMemo(
    () => [
      {
        title: "Encrypted Transfers",
        description: "Upload and share files securely across teams.",
        icon: "🔐",
        tone: "amber",
        bg: "linear-gradient(135deg, rgba(255, 138, 60, 0.15), rgba(255, 184, 77, 0.1)), url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 300%22><defs><linearGradient id=%22g%22 x1=%220%25%22 y1=%220%25%22 x2=%22100%25%22 y2=%22100%25%22><stop offset=%220%25%22 style=%22stop-color:rgba(255,138,60,0.3);stop-opacity:1%22/><stop offset=%22100%25%22 style=%22stop-color:rgba(255,184,77,0.2);stop-opacity:1%22/></linearGradient></defs><circle cx=%22100%22 cy=%22150%22 r=%2280%22 fill=%22url(%23g)%22/><rect x=%22220%22 y=%2280%22 width=%22120%22 height=%22140%22 rx=%2220%22 fill=%22url(%23g)%22/><path d=%22M 80 40 Q 120 20 160 40%22 stroke=%22rgba(255,138,60,0.4)%22 stroke-width=%222%22 fill=%22none%22/></svg>')"
      },
      {
        title: "Protected Access",
        description: "Password-based and authenticated entry for sensitive data.",
        icon: "🛡️",
        tone: "blue",
        bg: "linear-gradient(135deg, rgba(79, 140, 255, 0.15), rgba(0, 242, 254, 0.1)), url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 300%22><defs><linearGradient id=%22b%22 x1=%220%25%22 y1=%220%25%22 x2=%22100%25%22 y2=%22100%25%22><stop offset=%220%25%22 style=%22stop-color:rgba(79,140,255,0.3);stop-opacity:1%22/><stop offset=%22100%25%22 style=%22stop-color:rgba(0,242,254,0.2);stop-opacity:1%22/></linearGradient></defs><path d=%22M 120 80 L 120 160 M 120 160 L 200 160 M 200 160 L 200 80 M 200 80 L 120 80%22 stroke=%22rgba(79,140,255,0.4)%22 stroke-width=%223%22 fill=%22none%22/><circle cx=%22160%22 cy=%22120%22 r=%2215%22 fill=%22rgba(0,242,254,0.3)%22/></svg>')"
      },
      {
        title: "Expiry Controls",
        description: "Configure links and reduce risk from stale access.",
        icon: "⏰",
        tone: "mint",
        bg: "linear-gradient(135deg, rgba(52, 211, 153, 0.15), rgba(0, 242, 254, 0.1)), url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 300%22><defs><linearGradient id=%22m%22 x1=%220%25%22 y1=%220%25%22 x2=%22100%25%22 y2=%22100%25%22><stop offset=%220%25%22 style=%22stop-color:rgba(52,211,153,0.3);stop-opacity:1%22/><stop offset=%22100%25%22 style=%22stop-color:rgba(0,242,254,0.2);stop-opacity:1%22/></linearGradient></defs><circle cx=%22160%22 cy=%22120%22 r=%2250%22 stroke=%22rgba(52,211,153,0.4)%22 stroke-width=%225%22 fill=%22none%22/><line x1=%22160%22 y1=%2270%22 x2=%22160%22 y2=%2290%22 stroke=%22rgba(0,242,254,0.5)%22 stroke-width=%223%22/><line x1=%22160%22 y1=%22150%22 x2=%22160%22 y2=%22170%22 stroke=%22rgba(0,242,254,0.5)%22 stroke-width=%223%22/></svg>')"
      },
      {
        title: "Download Logs",
        description: "Monitor file activity with timestamps and user visibility.",
        icon: "📋",
        tone: "amber",
        bg: "linear-gradient(135deg, rgba(255, 138, 60, 0.15), rgba(255, 184, 77, 0.1)), url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 300%22><defs><linearGradient id=%22l%22 x1=%220%25%22 y1=%220%25%22 x2=%22100%25%22 y2=%22100%25%22><stop offset=%220%25%22 style=%22stop-color:rgba(255,138,60,0.3);stop-opacity:1%22/><stop offset=%22100%25%22 style=%22stop-color:rgba(255,184,77,0.2);stop-opacity:1%22/></linearGradient></defs><rect x=%2280%22 y=%2250%22 width=%22240%22 height=%22200%22 rx=%2210%22 fill=%22none%22 stroke=%22rgba(255,138,60,0.4)%22 stroke-width=%223%22/><line x1=%22100%22 y1=%2280%22 x2=%22300%22 y2=%2280%22 stroke=%22rgba(255,184,77,0.3)%22 stroke-width=%222%22/><line x1=%22100%22 y1=%22110%22 x2=%22260%22 y2=%22110%22 stroke=%22rgba(255,184,77,0.3)%22 stroke-width=%222%22/></svg>')"
      },
    ],
    []
  );

  useEffect(() => {
    const fetchMyGroups = async () => {
      if (!isLoggedIn) {
        setMyGroups([]);
        return;
      }

      try {
        setGroupsLoading(true);
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/api/groups/mine", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMyGroups(response.data?.groups || []);
      } catch {
        setMyGroups([]);
      } finally {
        setGroupsLoading(false);
      }
    };

    fetchMyGroups();
  }, [isLoggedIn]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 4600);

    return () => window.clearInterval(timer);
  }, [slides.length]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveServiceSlide((prev) => (prev + 1) % services.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [services.length]);

  useEffect(() => {
    if (!appToast.message) return;
    const timer = setTimeout(() => {
      setAppToast({ type: "", message: "" });
    }, 2800);
    return () => clearTimeout(timer);
  }, [appToast]);

  useEffect(() => {
    if (!location.state?.justLoggedOut) return;
    setAppToast({ type: "success", message: "Signed out successfully. See you next time!" });
  }, [location.state]);

  const handleJoinGroup = async (event) => {
    event.preventDefault();
    setJoining(true);
    setJoinError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login", { state: { from: "group-join" } });
        return;
      }

      const response = await axios.post(
        "http://localhost:5000/api/groups/join",
        { uniqueId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      navigate(`/group/${response.data.group.uniqueId}`, { state: { from: "home-join" } });
    } catch (err) {
      setJoinError(err.response?.data?.message || "Unable to join group");
    } finally {
      setJoining(false);
    }
  };

  const goNextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % slides.length);
  };

  const goPrevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goNextService = () => {
    setActiveServiceSlide((prev) => (prev + 1) % services.length);
  };

  const goPrevService = () => {
    setActiveServiceSlide((prev) => (prev - 1 + services.length) % services.length);
  };

  const handleTouchStart = (event) => {
    touchStartX.current = event.changedTouches[0]?.clientX || 0;
  };

  const handleTouchEnd = (event) => {
    const endX = event.changedTouches[0]?.clientX || 0;
    const deltaX = endX - touchStartX.current;
    if (Math.abs(deltaX) < 40) return;
    if (deltaX < 0) {
      goNextSlide();
    } else {
      goPrevSlide();
    }
  };

  const handleServiceTouchStart = (event) => {
    servicesTouchStartX.current = event.changedTouches[0]?.clientX || 0;
  };

  const handleServiceTouchEnd = (event) => {
    const endX = event.changedTouches[0]?.clientX || 0;
    const deltaX = endX - servicesTouchStartX.current;
    if (Math.abs(deltaX) < 40) return;
    if (deltaX < 0) {
      goNextService();
    } else {
      goPrevService();
    }
  };

  return (
    <div className="home-container" id="home" style={{ position: "relative" }}>
      {appToast.message && (
        <div className={`owner-toast owner-toast--${appToast.type}`} role="status" aria-live="polite">
          <div className="owner-toast-inner">
            <CheckCircle2 size={16} />
            <span>{appToast.message}</span>
          </div>
        </div>
      )}
      <Navbar />
      <main className="home-modern">
        <section className="modern-hero stagger-reveal reveal-1">
          <div className="modern-hero-copy">
            <p className="hero-kicker">Private File Collaboration</p>
            <h1>Share Securely. Collaborate Faster. Stay In Control.</h1>
            <p>
              SecureShare gives teams protected file spaces with encryption, access control, and
              full activity visibility.
            </p>
            <div className="modern-hero-cta">
              {!isLoggedIn ? (
                <button
                  type="button"
                  className="indian-button indian-button--indigo"
                  onClick={() => navigate("/register")}
                >
                  <UserPlus size={17} /> Get Started Now
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="indian-button indian-button--indigo"
                    onClick={() => navigate("/dashboard")}
                  >
                    <Upload size={17} /> Open Dashboard
                  </button>
                  <button
                    type="button"
                    className="indian-button indian-button--glass"
                    onClick={() => navigate("/groups/create")}
                  >
                    <BadgePlus size={17} /> Create Group
                  </button>
                </>
              )}
            </div>
            <div className="hero-trust-row">
              <span><CheckCircle2 size={16} /> Encrypted Storage</span>
              <span><CheckCircle2 size={16} /> Access Logs</span>
              <span><CheckCircle2 size={16} /> Group Workspaces</span>
            </div>
          </div>

          <div className="hero-slider-shell" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
            <div
              className={`hero-slider-card hero-slider-card--${slides[activeSlide].tone}`}
              key={activeSlide}
              style={{
                backgroundImage: `linear-gradient(145deg, rgba(4, 11, 24, 0.72), rgba(8, 20, 43, 0.84)), url(${slides[activeSlide].image})`,
              }}
            >
              <span className="hero-slider-hint">{slides[activeSlide].hint}</span>
              <div className="hero-slider-badge">{slides[activeSlide].metric}</div>
              <h3>{slides[activeSlide].title}</h3>
              <p>{slides[activeSlide].subtitle}</p>
              <button
                className="hero-inline-link"
                type="button"
                onClick={() => navigate(isLoggedIn ? "/dashboard" : "/register")}
              >
                Explore feature <ArrowRight size={16} />
              </button>
            </div>

            <div className="hero-slider-controls">
              <button type="button" onClick={goPrevSlide} aria-label="Previous slide">
                <span className="hero-arrow-mark" aria-hidden="true">&#8592;</span>
              </button>
              <div className="hero-dots" role="tablist" aria-label="Homepage highlights">
                {slides.map((slide, index) => (
                  <button
                    key={slide.metric}
                    type="button"
                    className={index === activeSlide ? "dot active" : "dot"}
                    aria-label={`Go to slide ${index + 1}`}
                    onClick={() => setActiveSlide(index)}
                  />
                ))}
              </div>
              <button type="button" onClick={goNextSlide} aria-label="Next slide">
                <span className="hero-arrow-mark" aria-hidden="true">&#8594;</span>
              </button>
            </div>

            <div className="hero-slider-strip" aria-label="Security highlights">
              {slides.map((slide, index) => (
                <button
                  key={`${slide.metric}-preview`}
                  type="button"
                  className={index === activeSlide ? "strip-card active" : "strip-card"}
                  onClick={() => setActiveSlide(index)}
                >
                  <span className="strip-label">{slide.hint}</span>
                  <strong>{slide.metric}</strong>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="modern-group-zone stagger-reveal reveal-2">
          <div className="modern-group-card">
            {isLoggedIn ? (
              <>
                <h2><Hash size={18} /> Join With Group ID</h2>
                <p>Enter a unique group ID to open the team workspace instantly.</p>
                <form onSubmit={handleJoinGroup} className="join-form-modern">
                  <label>
                    <span><Users size={15} /> Unique Group ID</span>
                    <input
                      value={uniqueId}
                      onChange={(e) => setUniqueId(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                      placeholder="Example: TEAMX1"
                      maxLength={12}
                      className="profile-input"
                    />
                  </label>
                  {joinError && <div className="join-error-modern">{joinError}</div>}
                  <div className="group-actions">
                    <button type="submit" className="indian-button indian-button--indigo" disabled={joining}>
                      {joining ? "Joining..." : "Join Group"}
                    </button>
                    <button
                      type="button"
                      className="indian-button indian-button--glass"
                      onClick={() => navigate("/groups/create")}
                    >
                      <BadgePlus size={16} /> Create Group
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <h2><Shield size={18} /> Start As A New User</h2>
                <p>
                  Register first to unlock secure group sharing, file dashboard access, and private logs.
                </p>
                <div className="group-actions">
                  <button
                    type="button"
                    className="indian-button indian-button--indigo"
                    onClick={() => navigate("/register")}
                  >
                    <UserPlus size={16} /> Register
                  </button>
                  <button
                    type="button"
                    className="indian-button indian-button--glass"
                    onClick={() => navigate("/login")}
                  >
                    <LogIn size={16} /> Login
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="modern-group-card modern-group-list">
            <h2>{isLoggedIn ? "Your Groups" : "Why Teams Choose Groups"}</h2>
            {isLoggedIn ? (
              <>
                <p>
                  {user?.username
                    ? `${user.username}, jump into your group workspace.`
                    : "Jump into your group workspace."}
                </p>
                {groupsLoading ? (
                  <p>Loading your groups...</p>
                ) : myGroups.length === 0 ? (
                  <p>You are not part of any group yet. Join one or create a new group.</p>
                ) : (
                  <div className="modern-group-buttons">
                    {myGroups.map((group) => (
                      <button
                        key={group.id}
                        type="button"
                        className="indian-button indian-button--glass"
                        onClick={() => navigate(`/group/${group.uniqueId}`)}
                      >
                        <span>
                          <strong>{group.name}</strong>
                          <small>
                            ID {group.uniqueId} · {group.memberCount}/{group.memberLimit} members
                          </small>
                        </span>
                        <ArrowRight size={16} />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <ul className="modern-list">
                <li>Dedicated workspace for each project or team</li>
                <li>Member limit and clean access boundary</li>
                <li>Faster file discovery inside group dashboard</li>
                <li>Clear ownership and controlled sharing</li>
              </ul>
            )}
          </div>
        </section>

        <section id="about" className="modern-section-card stagger-reveal reveal-3">
          <h2>About SecureShare</h2>
          <p>
            Built for privacy-first sharing, SecureShare combines encryption, authenticated access,
            and audit visibility so every shared file stays under your control.
          </p>
        </section>

        <section id="services" className="modern-section-card stagger-reveal reveal-4">
          <h2>Core Services</h2>
          
          <div className="services-carousel" onTouchStart={handleServiceTouchStart} onTouchEnd={handleServiceTouchEnd}>
            <div className={`service-card service-card--${services[activeServiceSlide].tone}`} key={activeServiceSlide}>
              <span className="service-icon">{services[activeServiceSlide].icon}</span>
              <h3>{services[activeServiceSlide].title}</h3>
              <p>{services[activeServiceSlide].description}</p>
              <button
                className="service-explore-link"
                type="button"
                onClick={() => navigate(isLoggedIn ? "/dashboard" : "/register")}
              >
                Learn more <ArrowRight size={16} />
              </button>
            </div>

            <div className="service-controls">
              <button type="button" onClick={goPrevService} aria-label="Previous service">
                <ChevronLeft size={18} />
              </button>
              <div className="service-dots" role="tablist" aria-label="Services">
                {services.map((service, index) => (
                  <button
                    key={service.title}
                    type="button"
                    className={index === activeServiceSlide ? "dot active" : "dot"}
                    aria-label={`Go to service ${index + 1}`}
                    onClick={() => setActiveServiceSlide(index)}
                  />
                ))}
              </div>
              <button type="button" onClick={goNextService} aria-label="Next service">
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="service-preview-strip">
              {services.map((service, index) => (
                <button
                  key={`${service.title}-preview`}
                  type="button"
                  className={index === activeServiceSlide ? "service-preview active" : "service-preview"}
                  onClick={() => setActiveServiceSlide(index)}
                >
                  <span className="preview-icon">{service.icon}</span>
                  <strong>{service.title}</strong>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="modern-section-card modern-contact stagger-reveal reveal-5">
          <h2>Contact</h2>
          <p>
            Need support? Reach us at <a href="mailto:support@secureshare.com">support@secureshare.com</a>.
          </p>
        </section>
      </main>
    </div>
  );
}
