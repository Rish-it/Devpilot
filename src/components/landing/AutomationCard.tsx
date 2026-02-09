interface AutomationCardProps {
    title: string;
    description: string;
    badge: string;
    icon?: string;
    comingSoon?: boolean;
}

export function AutomationCard({ title, description, badge, comingSoon }: AutomationCardProps) {
    return (
        <div className={`neu-card group ${comingSoon ? "opacity-50 pointer-events-none" : ""}`}>
            <div className="neu-card-inner">
                {/* Badge */}
                <div className="neu-badge-row">
                    <span className="neu-badge">{badge}</span>
                    <span className="neu-indicator" />
                </div>

                {/* Content */}
                <div className="neu-card-content">
                    <h2 className="neu-card-title">{title}</h2>
                    <p className={`neu-card-desc ${comingSoon ? "italic" : ""}`}>
                        {description}
                    </p>
                </div>
            </div>
        </div>
    );
}
