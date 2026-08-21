import { useMemo, useState } from "react";
import "./App.css";

/*
  IMPORTANT:
  These are ESTIMATES, not actual YouTube payout data.

  RPM = creator revenue per 1,000 monetized views.

  Each niche has a LOW and HIGH RPM.
  Country multiplier adjusts the range.

  There is NO artificial maximum views limit.
  1M, 10M, 100M, 1B+ views are supported.
*/

const NICHES = {
  Finance: {
    minRPM: 6,
    maxRPM: 18,
    sponsorRate: 1.8,
  },

  Technology: {
    minRPM: 4,
    maxRPM: 12,
    sponsorRate: 1.5,
  },

  Education: {
    minRPM: 3,
    maxRPM: 9,
    sponsorRate: 1.2,
  },
  Business: {
    minRPM: 5,
    maxRPM: 14,
    sponsorRate: 1.6,
  },
  Gaming: {
    minRPM: 1,
    maxRPM: 5,
    sponsorRate: 0.8,
  },
  Lifestyle: {
    minRPM: 2,
    maxRPM: 7,
    sponsorRate: 0.9,
  },
  Entertainment: {
    minRPM: 1,
    maxRPM: 4,
    sponsorRate: 0.7,
  },
  "Health & Fitness": {
    minRPM: 3,
    maxRPM: 8,
    sponsorRate: 1.1,
  },
};
const COUNTRIES = {
  India: 0.35,
  USA: 1,
  UK: 0.85,
  Canada: 0.8,
  Australia: 0.9,
  Germany: 0.75,
  "United Arab Emirates": 0.7,
  Singapore: 0.75,
};
const formatINR = (value) => {
  if (!Number.isFinite(value)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
};
const formatNumber = (value) => {
  if (!Number.isFinite(value)) return "0";
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(value);
};
const formatCompact = (value) => {
  if (!Number.isFinite(value)) return "0";
  if (value >= 1_000_000_000_000) {
    return `${(value / 1_000_000_000_000).toFixed(1)}T`;
  }
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}B`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return `${Math.round(value)}`;
};
const clampPercentage = (value) => {
  if (!Number.isFinite(value)) return 0;

  return Math.min(Math.max(value, 0), 100);
};

function App() {
  const [views, setViews] = useState(100000);
  const [videos, setVideos] = useState(8);
  const [type, setType] = useState("Long-form");
  const [niche, setNiche] = useState("Technology");
  const [country, setCountry] = useState("India");
  const [goal, setGoal] = useState(100000);
  const [activeTab, setActiveTab] = useState("calculator");
  const results = useMemo(() => {
    const nicheData = NICHES[niche];
    const countryMultiplier = COUNTRIES[country];
    let minRPM =
      nicheData.minRPM * countryMultiplier;
    let maxRPM =
      nicheData.maxRPM * countryMultiplier;
    if (type === "Shorts") {
      minRPM *= 0.08;
      maxRPM *= 0.08;
    }
    const adRevenueMin =
      (views / 1000) * minRPM;
    const adRevenueMax =
      (views / 1000) * maxRPM;
    const sponsorshipMin =
      type === "Shorts"
        ? views * nicheData.sponsorRate * 0.00004
        : views * nicheData.sponsorRate * 0.00008;

    const sponsorshipMax =
      type === "Shorts"
        ? views * nicheData.sponsorRate * 0.00012
        : views * nicheData.sponsorRate * 0.00025;
    const affiliateMin =
      adRevenueMin * 0.08;

    const affiliateMax =
      adRevenueMax * 0.15;

    /*
      Membership estimate
    */

    const membershipMin =
      adRevenueMin * 0.02;

    const membershipMax =
      adRevenueMax * 0.06;

    /*
      Total creator income range
    */

    const totalMin =
      adRevenueMin +
      sponsorshipMin +
      affiliateMin +
      membershipMin;

    const totalMax =
      adRevenueMax +
      sponsorshipMax +
      affiliateMax +
      membershipMax;

    const yearlyMin =
      totalMin * 12;

    const yearlyMax =
      totalMax * 12;

    /*
      Revenue per view.

      Used by Goal Calculator.
    */

    const minRevenuePerView =
      totalMin / Math.max(views, 1);

    const maxRevenuePerView =
      totalMax / Math.max(views, 1);

    /*
      Required views for goal.

      Conservative = higher views needed.
      Optimistic = lower views needed.
    */

    const requiredViewsLow =
      goal / Math.max(maxRevenuePerView, 0.000000001);

    const requiredViewsHigh =
      goal / Math.max(minRevenuePerView, 0.000000001);

    return {
      minRPM,
      maxRPM,

      adRevenueMin,
      adRevenueMax,

      sponsorshipMin,
      sponsorshipMax,

      affiliateMin,
      affiliateMax,

      membershipMin,
      membershipMax,

      totalMin,
      totalMax,

      yearlyMin,
      yearlyMax,

      requiredViewsLow,
      requiredViewsHigh,
    };
  }, [
    views,
    type,
    niche,
    country,
    goal,
  ]);

  /* ------------------------------------------------ */
  /* RESET */
  /* ------------------------------------------------ */

  const resetCalculator = () => {
    setViews(100000);
    setVideos(8);
    setType("Long-form");
    setNiche("Technology");
    setCountry("India");
    setGoal(100000);
  };

  /* ------------------------------------------------ */
  /* QUICK VIEW BUTTONS */
  /* ------------------------------------------------ */

  const quickViews = [
    {
      label: "100K",
      value: 100000,
    },
    {
      label: "1M",
      value: 1000000,
    },
    {
      label: "10M",
      value: 10000000,
    },
    {
      label: "100M",
      value: 100000000,
    },
    {
      label: "1B",
      value: 1000000000,
    },
  ];

  /* ------------------------------------------------ */
  /* RENDER */
  /* ------------------------------------------------ */

  return (
    <div className="app">

      {/* NAVBAR */}

      <nav className="navbar">
        <div className="nav-container">

          <div className="brand">

            <div className="brand-icon">
              ▶
            </div>

            <div>
              <h1>CreatorCalc</h1>

              <span>
                YouTube Revenue Intelligence
              </span>
            </div>

          </div>

          <div className="nav-links">

            <button
              className={
                activeTab === "calculator"
                  ? "nav-btn active"
                  : "nav-btn"
              }
              onClick={() =>
                setActiveTab("calculator")
              }
            >
              Calculator
            </button>

            <button
              className={
                activeTab === "goal"
                  ? "nav-btn active"
                  : "nav-btn"
              }
              onClick={() =>
                setActiveTab("goal")
              }
            >
              Goal Calculator
            </button>

          </div>

          <button
            className="reset-btn"
            onClick={resetCalculator}
          >
            Reset
          </button>

        </div>
      </nav>

      {/* HERO */}

      <section className="hero">

        <div className="hero-badge">

          <span />

          Creator Revenue Calculator

        </div>

        <h2>
          How much can your
          <strong> YouTube channel </strong>
          make?
        </h2>

        <p>
          Estimate your YouTube ad revenue,
          sponsorships, affiliate income and
          total creator earnings.
        </p>

      </section>

      {/* MAIN */}

      <main className="main-container">

        {activeTab === "calculator" ? (

          <div className="calculator-grid">

            {/* INPUT PANEL */}

            <div className="input-card">

              <div className="card-heading">

                <div>

                  <h3>
                    Channel Details
                  </h3>

                  <p>
                    Enter your estimated monthly stats
                  </p>

                </div>

                <span className="heading-icon">
                  ⚙️
                </span>

              </div>

              {/* VIEWS */}

              <div className="form-group">

                <label>
                  Monthly Views
                </label>

                <input
                  type="number"
                  min="0"
                  step="1"
                  value={views}
                  onChange={(e) => {
                    const value =
                      Number(e.target.value);

                    setViews(
                      Number.isFinite(value)
                        ? Math.max(0, value)
                        : 0
                    );
                  }}
                />

                <div className="quick-buttons">

                  {quickViews.map((item) => (
                    <button
                      key={item.value}
                      onClick={() =>
                        setViews(item.value)
                      }
                    >
                      {item.label}
                    </button>
                  ))}

                </div>

                <div className="views-info">

                  <span>
                    Current:
                  </span>

                  <strong>
                    {formatCompact(views)}
                  </strong>

                  <span>
                    views/month
                  </span>

                </div>

              </div>

              {/* VIDEOS */}

              <div className="form-group">

                <label>
                  Videos Per Month
                </label>

                <input
                  type="number"
                  min="1"
                  step="1"
                  value={videos}
                  onChange={(e) => {
                    const value =
                      Number(e.target.value);

                    setVideos(
                      Number.isFinite(value)
                        ? Math.max(1, value)
                        : 1
                    );
                  }}
                />

              </div>

              {/* CONTENT TYPE */}

              <div className="form-group">

                <label>
                  Content Type
                </label>

                <div className="type-buttons">

                  {[
                    "Long-form",
                    "Shorts",
                  ].map((item) => (

                    <button
                      key={item}
                      className={
                        type === item
                          ? "type-btn selected"
                          : "type-btn"
                      }
                      onClick={() =>
                        setType(item)
                      }
                    >

                      {item === "Long-form"
                        ? "🎥"
                        : "⚡"}

                      {" "}

                      {item}

                    </button>

                  ))}

                </div>

              </div>

              {/* NICHE */}

              <div className="form-group">

                <label>
                  Niche
                </label>

                <select
                  value={niche}
                  onChange={(e) =>
                    setNiche(e.target.value)
                  }
                >

                  {Object.keys(NICHES).map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* COUNTRY */}

              <div className="form-group">

                <label>
                  Primary Audience
                </label>

                <select
                  value={country}
                  onChange={(e) =>
                    setCountry(e.target.value)
                  }
                >

                  {Object.keys(COUNTRIES).map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* RPM INFO */}

              <div className="rpm-box">

                <div>

                  <span>
                    Estimated RPM Range
                  </span>

                  <strong>
                    $
                    {results.minRPM.toFixed(2)}
                    {" – "}
                    $
                    {results.maxRPM.toFixed(2)}
                  </strong>

                </div>

                <span className="rpm-question">
                  ?
                </span>

              </div>

              {/* WARNING */}

              <div className="warning">

                ⚠️

                <span>
                  These numbers are estimates.
                  Actual YouTube earnings vary
                  based on audience, watch time,
                  monetization, advertiser demand,
                  seasonality and other factors.
                </span>

              </div>

            </div>

            {/* RESULTS */}

            <div className="results">

              {/* MAIN REVENUE CARD */}

              <div className="revenue-card">

                <div className="revenue-main">

                  <span>
                    Estimated Monthly Income
                  </span>

                  <div className="income-range">

                    <h3>
                      {formatINR(
                        results.totalMin
                      )}
                    </h3>

                    <span>
                      –
                    </span>

                    <h3>
                      {formatINR(
                        results.totalMax
                      )}
                    </h3>

                  </div>

                  <p className="range-label">
                    Conservative estimate
                    {" → "}
                    Higher estimate
                  </p>

                </div>

                <div className="money-icon">
                  💰
                </div>

                <div className="mini-stats">

                  <div>

                    <span>
                      Yearly Estimate
                    </span>

                    <strong>
                      {formatINR(
                        results.yearlyMin
                      )}
                      {" – "}
                      {formatINR(
                        results.yearlyMax
                      )}
                    </strong>

                  </div>

                  <div>

                    <span>
                      Estimated RPM
                    </span>

                    <strong>
                      $
                      {results.minRPM.toFixed(2)}
                      {" – "}
                      $
                      {results.maxRPM.toFixed(2)}
                    </strong>

                  </div>

                </div>

              </div>

              {/* BREAKDOWN */}

              <div className="result-card">

                <div className="result-title">

                  <div>

                    <h3>
                      Revenue Breakdown
                    </h3>

                    <p>
                      Estimated monthly income sources
                    </p>

                  </div>

                </div>

                <RevenueRow
                  icon="▶️"
                  title="YouTube Ads"
                  minValue={
                    results.adRevenueMin
                  }
                  maxValue={
                    results.adRevenueMax
                  }
                  totalMin={
                    results.totalMin
                  }
                  totalMax={
                    results.totalMax
                  }
                />

                <RevenueRow
                  icon="🤝"
                  title="Sponsorships"
                  minValue={
                    results.sponsorshipMin
                  }
                  maxValue={
                    results.sponsorshipMax
                  }
                  totalMin={
                    results.totalMin
                  }
                  totalMax={
                    results.totalMax
                  }
                />

                <RevenueRow
                  icon="🔗"
                  title="Affiliate Income"
                  minValue={
                    results.affiliateMin
                  }
                  maxValue={
                    results.affiliateMax
                  }
                  totalMin={
                    results.totalMin
                  }
                  totalMax={
                    results.totalMax
                  }
                />

                <RevenueRow
                  icon="⭐"
                  title="Memberships"
                  minValue={
                    results.membershipMin
                  }
                  maxValue={
                    results.membershipMax
                  }
                  totalMin={
                    results.totalMin
                  }
                  totalMax={
                    results.totalMax
                  }
                />

              </div>
              <div className="stats-grid">
                <StatCard
                  title="Revenue / Video"
                  value={`${formatINR(
                    results.totalMin /
                      Math.max(videos, 1)
                  )} – ${formatINR(
                    results.totalMax /
                      Math.max(videos, 1)
                  )}`}
                  icon="🎬"
                />
                <StatCard
                  title="Revenue / 100K Views"
                  value={`${formatINR(
                    (results.totalMin /
                      Math.max(views, 1)) *
                      100000
                  )} – ${formatINR(
                    (results.totalMax /
                      Math.max(views, 1)) *
                      100000
                  )}`}
                  icon="📈"
                />
                <StatCard
                  title="Annual Potential"
                  value={`${formatINR(
                    results.yearlyMin
                  )} – ${formatINR(
                    results.yearlyMax
                  )}`}
                  icon="🚀"
                />

              </div>

              {/* PROJECTION */}

              <div className="result-card">

                <h3>
                  Revenue Projection
                </h3>

                <p className="subtext">
                  See how your estimated income
                  changes with more monthly views.
                </p>

                <div className="projection-list">

                  {[0.5, 1, 2, 5, 10, 25, 100].map(
                    (multiplier) => {

                      const projectedViews =
                        views * multiplier;

                      const minRevenue =
                        (results.totalMin /
                          Math.max(views, 1)) *
                        projectedViews;

                      const maxRevenue =
                        (results.totalMax /
                          Math.max(views, 1)) *
                        projectedViews;

                      return (

                        <div
                          className="projection-row"
                          key={multiplier}
                        >

                          <div className="projection-left">

                            <div className="multiplier">
                              {multiplier}x
                            </div>

                            <div>

                              <strong>
                                {formatCompact(
                                  projectedViews
                                )}
                              </strong>

                              <span>
                                views / month
                              </span>

                            </div>

                          </div>

                          <strong>
                            {formatINR(
                              minRevenue
                            )}
                            {" – "}
                            {formatINR(
                              maxRevenue
                            )}
                          </strong>

                        </div>

                      );
                    }
                  )}

                </div>

              </div>

            </div>

          </div>

        ) : (

          /* GOAL CALCULATOR */

          <div className="goal-container">

            <div className="goal-card">

              <div className="goal-header">

                <div className="goal-icon">
                  🎯
                </div>

                <h2>
                  How many views do you need?
                </h2>

                <p>
                  Set your monthly income goal
                  and estimate how many views
                  you may need to reach it.
                </p>

              </div>

              <div className="goal-form">

                <label>
                  Monthly Income Goal
                </label>

                <input
                  type="number"
                  min="0"
                  step="1"
                  value={goal}
                  onChange={(e) => {

                    const value =
                      Number(e.target.value);

                    setGoal(
                      Number.isFinite(value)
                        ? Math.max(0, value)
                        : 0
                    );

                  }}
                />

                <div className="goal-buttons">

                  {[50000, 100000, 500000, 1000000].map(
                    (amount) => (

                      <button
                        key={amount}
                        onClick={() =>
                          setGoal(amount)
                        }
                      >
                        {formatINR(amount)}
                      </button>

                    )
                  )}

                </div>

                <div className="goal-result">

                  <span>
                    Estimated Monthly Views Required
                  </span>

                  <div className="goal-range">

                    <div>

                      <small>
                        Best-case
                      </small>

                      <h3>
                        {formatNumber(
                          results.requiredViewsLow
                        )}
                      </h3>

                    </div>

                    <span>
                      –
                    </span>

                    <div>

                      <small>
                        Conservative
                      </small>

                      <h3>
                        {formatNumber(
                          results.requiredViewsHigh
                        )}
                      </h3>

                    </div>

                  </div>

                  <p>
                    views / month
                  </p>

                </div>

                <div className="goal-stats">

                  <div>

                    <span>
                      Current Views
                    </span>

                    <strong>
                      {formatNumber(views)}
                    </strong>

                  </div>

                  <div>

                    <span>
                      Current Estimate
                    </span>

                    <strong>
                      {formatINR(
                        results.totalMin
                      )}
                      {" – "}
                      {formatINR(
                        results.totalMax
                      )}
                    </strong>

                  </div>

                </div>

              </div>

            </div>

          </div>

        )}

      </main>

      <footer>

        <strong>
          CreatorCalc
        </strong>
        <span>
          Estimates, not financial guarantees.
        </span>
        <span>
          Built for creators 🚀
        </span>
      </footer>

    </div>
  );
}


function RevenueRow({
  icon,
  title,
  minValue,
  maxValue,
  totalMin,
  totalMax,
}) {
  const minPercentage =
    totalMin > 0
      ? (minValue / totalMin) * 100
      : 0;

  const maxPercentage =
    totalMax > 0
      ? (maxValue / totalMax) * 100
      : 0;

  const percentage =
    (minPercentage + maxPercentage) / 2;

  return (

    <div className="revenue-row">

      <div className="revenue-info">

        <div className="revenue-icon">
          {icon}
        </div>

        <div>

          <strong>
            {title}
          </strong>

          <span>
            {clampPercentage(
              percentage
            ).toFixed(1)}
            % of estimated income
          </span>

        </div>

      </div>

      <div className="revenue-value">

        <strong>
          {formatINR(minValue)}
          {" – "}
          {formatINR(maxValue)}
        </strong>

        <div className="progress">

          <div
            style={{
              width: `${clampPercentage(
                percentage
              )}%`,
            }}
          />

        </div>

      </div>

    </div>

  );
}



function StatCard({
  title,
  value,
  icon,
}) {
  return (

    <div className="stat-card">

      <div className="stat-top">

        <span>
          {title}
        </span>

        <span>
          {icon}
        </span>

      </div>

      <strong>
        {value}
      </strong>

    </div>

  );
}

export default App;