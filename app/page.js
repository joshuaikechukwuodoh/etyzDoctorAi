"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import "./globals.css";

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("signin");
  const [userData, setUserData] = useState(null);
  const [view, setView] = useState("landing"); // "landing", "dashboard", "chat"
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, view]);

  useEffect(() => {
    // Fetch user data
    const fetchUserData = async () => {
      try {
        const res = await fetch("/api/user");
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setUserData(data.user);
            setIsAuthenticated(true);
            setView("dashboard");
          } else {
            setView("landing");
          }
        } else {
          setView("landing");
        }
      } catch (error) {
        console.log("Not authenticated");
        setView("landing");
      }
    };

    fetchUserData();
  }, []);

  // Load chat history when entering chat view
  useEffect(() => {
    if (view === "chat" && isAuthenticated) {
      const loadHistory = async () => {
        try {
          const res = await fetch("/api/mefi");
          if (res.ok) {
            const history = await res.json();
            const formattedHistory = history.flatMap((item) => [
              { role: "user", content: item.question },
              { role: "assistant", content: item.answer },
            ]);
            setMessages(formattedHistory);
          }
        } catch (error) {
          console.log("No history available");
        }
      };
      loadHistory();
    }
  }, [view, isAuthenticated]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/mefi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();
      const assistantMessage = { role: "assistant", content: data.answer };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get("email");
    const password = formData.get("password");
    const name = formData.get("name");

    try {
      const endpoint =
        authMode === "signin"
          ? "/api/auth/sign-in/email"
          : "/api/auth/sign-up/email";

      const body =
        authMode === "signin" ? { email, password } : { email, password, name };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        // Fetch user data after successful auth
        const userRes = await fetch("/api/user");
        if (userRes.ok) {
          const data = await userRes.json();
          if (data.user) {
            setUserData(data.user);
            setIsAuthenticated(true);
            setShowAuth(false);
            setView("dashboard");
          }
        }
      } else {
        alert("Authentication failed. Please try again.");
      }
    } catch (error) {
      alert("An error occurred. Please try again.");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/sign-out", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      setIsAuthenticated(false);
      setUserData(null);
      setMessages([]);
      setView("landing");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const LandingView = () => (
    <div className="landing-view">
      {/* Hero Section */}
      <section className="hero-section fade-in">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-icon">✨</span>
            <span>Powered by Advanced AI Technology</span>
          </div>
          <h1 className="hero-title">
            Your Trusted <span className="gradient-text">AI Medical</span>{" "}
            Information Assistant
          </h1>
          <p className="hero-description">
            Get reliable, evidence-based health information instantly. Joshua
            Smith AI combines cutting-edge artificial intelligence with medical
            knowledge to provide you with accurate answers to your health
            questions.
          </p>
          <div className="hero-actions">
            <button
              className="cta-button primary"
              onClick={() => setShowAuth(true)}
            >
              <span>Get Started</span>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 12H19M19 12L12 5M19 12L12 19"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              className="cta-button secondary"
              onClick={() =>
                document
                  .getElementById("features")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              <span>Learn More</span>
            </button>
          </div>
        </div>

        {/* Animated Hero Cards */}
        <div className="hero-image">
          <div className="floating-card card-1 pulse-animation">
            <div className="card-icon">🩺</div>
            <div className="card-content">
              <h4>Medical Expertise</h4>
              <p>Evidence-based insights</p>
            </div>
          </div>
          <div
            className="floating-card card-2 pulse-animation"
            style={{ animationDelay: "1s" }}
          >
            <div className="card-icon">⚡</div>
            <div className="card-content">
              <h4>Instant Response</h4>
              <p>Real-time answers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="features-section" id="features">
        <div className="section-header">
          <h2 className="section-title">Why Choose Joshua Smith AI?</h2>
          <p className="section-description">
            Experience the future of medical information assistance with our
            advanced AI technology
          </p>
        </div>
        <div className="features-grid">
          {[
            {
              icon: "🧠",
              title: "Advanced AI",
              desc: "Powered by state-of-the-art language models trained on vast medical literature.",
            },
            {
              icon: "🔒",
              title: "Privacy First",
              desc: "Your health information is sensitive. We employ enterprise-grade security.",
            },
            {
              icon: "⚡",
              title: "Lightning Fast",
              desc: "Get instant answers to your health questions without waiting.",
            },
            {
              icon: "📚",
              title: "Comprehensive",
              desc: "Access a vast database of medical information covering symptoms and treatments.",
            },
          ].map((feature, idx) => (
            <div key={idx} className="feature-card-large">
              <div className="feature-icon-large">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer-like Info */}
      <footer className="simple-footer">
        <p>&copy; 2025 Joshua Smith AI. All rights reserved.</p>
        <p className="footer-disclaimer">
          ⚠️ This AI assistant provides general health information only. Always
          consult healthcare professionals.
        </p>
      </footer>
    </div>
  );

  const DashboardView = () => (
    <div className="dashboard-container">
      <div className="dashboard-card slide-up-animation">
        <div className="dashboard-header">
          <div className="avatar-large">
            {userData?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <h2>
            Welcome Back,{" "}
            <span className="highlight-text">{userData?.name}</span>
          </h2>
        </div>

        <div className="user-info-grid">
          <div className="info-item">
            <span className="label">Full Name</span>
            <span className="value">{userData?.name}</span>
          </div>
          <div className="info-item">
            <span className="label">Email Address</span>
            <span className="value">{userData?.email}</span>
          </div>
          <div className="info-item">
            <span className="label">Password</span>
            <span className="value password-mask">••••••••••••</span>
          </div>
          <div className="info-item">
            <span className="label">Account Status</span>
            <span className="value status-active">Active</span>
          </div>
        </div>

        <div className="dashboard-actions">
          <button
            className="primary-button action-button"
            onClick={() => setView("chat")}
          >
            <span className="icon">💬</span> Start Consultation
          </button>
          <button
            className="secondary-button action-button"
            onClick={handleLogout}
          >
            <span className="icon">🚪</span> Sign Out
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="app-container">
      {/* Background Animation */}
      <div className="bg-gradient-animated"></div>
      <div className="bg-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>

      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <div
            className="logo-container"
            onClick={() => setView(isAuthenticated ? "dashboard" : "landing")}
            style={{ cursor: "pointer" }}
          >
            <div className="logo-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2L2 7L12 12L22 7L12 2Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 17L12 22L22 17"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 12L12 17L22 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="logo-text">
              <h1>Joshua Smith</h1>
              <span>AI Medical Assistant</span>
            </div>
          </div>

          <div className="nav-actions">
            {isAuthenticated && (
              <button className="nav-logout-btn" onClick={handleLogout}>
                Logout
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {view === "landing" && <LandingView />}
        {view === "dashboard" && <DashboardView />}
        {view === "chat" && (
          <div className="chat-interface-wrapper fade-in">
            <div className="chat-header-bar">
              <button
                className="back-button"
                onClick={() => setView("dashboard")}
              >
                ← Back to Dashboard
              </button>
            </div>
            <div className="chat-container">
              <div className="messages-area">
                {messages.length === 0 && (
                  <div className="empty-chat-state">
                    <p>How can I help you with your health today?</p>
                  </div>
                )}
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`message ${
                      msg.role === "user" ? "user" : "assistant"
                    }`}
                  >
                    <div className="message-avatar">
                      {msg.role === "user" ? "👤" : "🤖"}
                    </div>
                    <div className="message-content">
                      <div className="message-bubble">{msg.content}</div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="message assistant">
                    <div className="message-avatar">🤖</div>
                    <div className="message-content">
                      <div className="message-bubble loading">
                        <div className="typing-indicator">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            <div className="input-container">
              <div className="input-wrapper">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your health queries here..."
                  className="message-input"
                  rows="1"
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="send-button"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M22 2L11 13"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M22 2L15 22L11 13L2 9L22 2Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
              <p className="disclaimer">
                ⚠️ Generative AI is not a substitute for professional medical
                advice.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Auth Modal */}
      {showAuth && (
        <div className="modal-overlay" onClick={() => setShowAuth(false)}>
          <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={() => setShowAuth(false)}>
              ×
            </button>
            <h2>{authMode === "signin" ? "Welcome Back" : "Create Account"}</h2>
            <form onSubmit={handleAuth}>
              {authMode === "signup" && (
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  required
                  className="auth-input"
                />
              )}
              <input
                type="email"
                name="email"
                placeholder="Email"
                required
                className="auth-input"
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                required
                className="auth-input"
              />
              <button type="submit" className="submit-button">
                {authMode === "signin" ? "Sign In" : "Sign Up"}
              </button>
            </form>
            <button
              className="toggle-auth"
              onClick={() =>
                setAuthMode(authMode === "signin" ? "signup" : "signin")
              }
            >
              {authMode === "signin"
                ? "Need an account? Sign up"
                : "Have an account? Sign in"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
