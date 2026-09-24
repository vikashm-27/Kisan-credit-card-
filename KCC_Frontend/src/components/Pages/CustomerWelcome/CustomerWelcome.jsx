import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    UserPlus,
    LayoutDashboard,
    FileText,
    ArrowRight,
    Sparkles,
    ShieldCheck,
    Users
} from 'lucide-react';
import './CustomerWelcome.css';

const CustomerWelcome = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const userRole = JSON.parse(localStorage.getItem("user"))?.role || "user";

    const actions = [
        {
            title: t("customer_welcome.card_add_title"),
            desc: t("customer_welcome.card_add_desc"),
            icon: UserPlus,
            color: "green",
            path: "/customer/kyc",
            delay: "200ms",
            roles: ["admin", "user"]
        },
        {
            title: t("customer_welcome.card_analytics_title"),
            desc: t("customer_welcome.card_analytics_desc"),
            icon: LayoutDashboard,
            color: "blue",
            path: "/customer/dashboard",
            delay: "300ms",
            roles: ["admin"]
        },
        {
            title: t("customer_welcome.card_reports_title"),
            desc: t("customer_welcome.card_reports_desc"),
            icon: FileText,
            color: "purple",
            path: "/customer/kyclogs",
            delay: "400ms",
            roles: ["admin"]
        }
    ].filter(action => action.roles.includes(userRole));


    if (!mounted) return null;

    return (
        <div className="welcome-container">
            {/* Animated background elements */}
            <div className="bg-shape shape-1"></div>
            <div className="bg-shape shape-2"></div>

            <div className="welcome-hero">
                <div className="welcome-badge">
                    <Sparkles size={16} />
                    <span>{t("customer_welcome.badge")}</span>
                </div>
                <h1 className="welcome-title">
                    {t("customer_welcome.title_1")}<br />
                    <span className="title-gradient">{t("customer_welcome.title_2")}</span>
                </h1>
                <p className="welcome-subtitle">
                    {t("customer_welcome.subtitle")}
                </p>
            </div>

            <div className="actions-grid">
                {actions.map((item, index) => (
                    <div
                        key={index}
                        className="action-card"
                        onClick={() => navigate(item.path)}
                        style={{ animationDelay: item.delay }}
                    >
                        <div className={`card-icon icon-${item.color}`}>
                            <item.icon size={24} />
                        </div>
                        <div className="card-content">
                            <h3>{item.title}</h3>
                            <p>{item.desc}</p>
                        </div>
                        <div className={`card-footer footer-${item.color}`}>
                            <span>{t("customer_welcome.get_started")}</span>
                            <ArrowRight size={16} className="arrow-icon" />
                        </div>
                    </div>
                ))}
            </div>

            <div className={`mt-12 flex items-center gap-2 text-gray-400 text-sm transition-all duration-1000 delay-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
                <ShieldCheck size={16} className="text-green-500" />
                <span>{t("customer_welcome.compliance_footer")}</span>
            </div>
        </div>
    );
};

export default CustomerWelcome;
