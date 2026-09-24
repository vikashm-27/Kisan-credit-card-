import React from "react";
import { Link } from "react-router-dom";
import { Leaf, ShieldCheck, Sprout, Wheat, Star, CheckCircle, UserCheck, FileText, Coins, ScrollText, Globe, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import "./LandingPage.css";

const LandingPage = () => {
  const { t, i18n } = useTranslation();
  return (
    <div className="landing-root">
      {/* Header */}
      <header className="landing-header">
        <Link to="/" className="landing-logo">
          <div className="landing-logo-icon">
            <Leaf size={24} />
          </div>
          <div className="landing-logo-text">
            <span className="landing-logo-title">Draft KCC</span>
            <span className="landing-logo-subtitle">Kisan Credit Card Portal</span>
          </div>
        </Link>
        <nav className="landing-nav">
          {/* Language Switcher */}
          <div className="landing-lang-wrapper">
            <Globe size={15} className="landing-lang-icon" />
            <select
              onChange={(e) => i18n.changeLanguage(e.target.value)}
              value={i18n.language}
              className="landing-lang-select"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी</option>
              <option value="ta">தமிழ்</option>
              <option value="te">తెలుగు</option>
              <option value="kn">ಕನ್ನಡ</option>
            </select>
            <ChevronDown size={14} className="landing-lang-chevron" />
          </div>
          <Link to="/login" className="btn-login">{t('landing.login')}</Link>
          <Link to="/signup" className="btn-signup">{t('landing.signup')}</Link>
        </nav>
      </header>

      {/* Hero Content */}
      <main className="landing-hero">
        <Leaf className="hero-bg-graphic" size={400} />
        <div className="hero-content-wrapper">
          <div className="hero-badge">
            <Leaf size={16} />
            {t('landing.badge')}
          </div>
          
          <h1 className="hero-title">
            {t('landing.hero_title_1')}<span>{t('landing.hero_title_2')}</span> <br />
            {t('landing.hero_title_3')}
          </h1>
          
          <p className="hero-subtitle">
            {t('landing.hero_subtitle')}
          </p>

          <div className="hero-cta-group">
            <Link to="/signup" className="btn-primary-large">
              {t('landing.start_btn')}
            </Link>
          </div>
        </div>
      </main>

      {/* Information Hub Section */}
      <section className="landing-info-hub">
        <div className="section-header">
          <h2 className="section-title">{t('landing_hub.kcc_details_title')}</h2>
          <p className="section-subtitle">{t('landing_hub.kcc_details_sub')}</p>
        </div>
        
        <div className="info-grid">
          <div className="info-card">
            <Star className="info-icon" size={28} />
            <h3>{t('landing_hub.benefits_title')}</h3>
            <ul>
              <li>{t('landing_hub.b_1')}</li>
              <li>{t('landing_hub.b_2')}</li>
              <li>{t('landing_hub.b_3')}</li>
              <li>{t('landing_hub.b_4')}</li>
            </ul>
          </div>
          <div className="info-card">
            <CheckCircle className="info-icon" size={28} />
            <h3>{t('landing_hub.features_title')}</h3>
            <ul>
              <li>{t('landing_hub.f_1')}</li>
              <li>{t('landing_hub.f_2')}</li>
              <li>{t('landing_hub.f_3')}</li>
              <li>{t('landing_hub.f_4')}</li>
            </ul>
          </div>
          <div className="info-card">
            <UserCheck className="info-icon" size={28} />
            <h3>{t('landing_hub.eligibility_title')}</h3>
            <ul>
              <li>{t('landing_hub.e_1')}</li>
              <li>{t('landing_hub.e_2')}</li>
              <li>{t('landing_hub.e_3')}</li>
              <li>{t('landing_hub.e_4')}</li>
            </ul>
          </div>
          <div className="info-card">
            <FileText className="info-icon" size={28} />
            <h3>{t('landing_hub.docs_title')}</h3>
            <ul>
              <li>{t('landing_hub.d_1')}</li>
              <li>{t('landing_hub.d_2')}</li>
              <li>{t('landing_hub.d_3')}</li>
              <li>{t('landing_hub.d_4')}</li>
            </ul>
          </div>
          <div className="info-card">
            <Coins className="info-icon" size={28} />
            <h3>{t('landing_hub.fees_title')}</h3>
            <ul>
              <li>{t('landing_hub.fc_1')}</li>
              <li>{t('landing_hub.fc_2')}</li>
              <li>{t('landing_hub.fc_3')}</li>
              <li>{t('landing_hub.fc_4')}</li>
            </ul>
          </div>
          <div className="info-card">
            <ScrollText className="info-icon" size={28} />
            <h3>{t('landing_hub.mitc_title')}</h3>
            <ul>
              <li>{t('landing_hub.m_1')}</li>
              <li>{t('landing_hub.m_2')}</li>
              <li>{t('landing_hub.m_3')}</li>
              <li>{t('landing_hub.m_4')}</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="landing-features">
        <div className="section-header">
          <h2 className="section-title">{t('landing_hub.core_services_title')}</h2>
          <p className="section-subtitle">{t('landing_hub.core_services_sub')}</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <ShieldCheck size={32} />
            </div>
            <h3 className="feature-title">{t('landing_hub.service_kyc_title')}</h3>
            <p className="feature-desc">
              {t('landing_hub.service_kyc_desc')}
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <Sprout size={32} />
            </div>
            <h3 className="feature-title">{t('landing_hub.service_kcc_title')}</h3>
            <p className="feature-desc">
              {t('landing_hub.service_kcc_desc')}
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <Wheat size={32} />
            </div>
            <h3 className="feature-title">{t('landing_hub.service_loan_title')}</h3>
            <p className="feature-desc">
              {t('landing_hub.service_loan_desc')}
            </p>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="landing-stats">
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-value">12k+</span>
            <span className="stat-label">{t('landing_hub.stat_verified_farmers')}</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">99%</span>
            <span className="stat-label">{t('landing_hub.stat_success_rate')}</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">24h</span>
            <span className="stat-label">{t('landing_hub.stat_processing_time')}</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">5+</span>
            <span className="stat-label">{t('landing_hub.stat_identity_modules')}</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-logo">
            <Leaf className="footer-logo-icon" size={24} />
            Draft KCC
          </div>
          <p className="footer-text">
            {t('landing_hub.footer_rights')} <br/>
            {t('landing_hub.footer_security')}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
