interface AutomationCardProps {
    title: string;
    description: string;
    badge: string;
    icon?: string;
    comingSoon?: boolean;
}

export function AutomationCard({ title, description, badge, comingSoon }: AutomationCardProps) {
    return (
        <div className={`relative group ${comingSoon ? "opacity-60" : "cursor-pointer"}`}>
            {/* Main card with stronger shadow for grey bg */}
            <div
                className={`landing-automation-card relative z-10 flex flex-col h-40 rounded-2xl border border-black/8 bg-white transition-transform duration-300 ${comingSoon ? "" : "group-hover:-translate-y-1"}`}
                style={{ boxShadow: "0 4px 20px -4px rgba(0,0,0,0.15), 0 2px 8px -2px rgba(0,0,0,0.1)" }}
            >
                <div className="landing-card-header">
                    <div className="landing-card-badge mb-0 w-fit">{badge}</div>
                </div>
                <div className="landing-card-body">
                    <h2 className="text-base font-semibold text-foreground mb-1.5">{title}</h2>
                    <p className={`text-sm leading-relaxed ${comingSoon ? "italic text-muted-foreground/70" : "text-muted-foreground"}`}>{description}</p>
                </div>
            </div>

            {/* Stacked layers - grey shades visible on grey background */}
            <div
                className="absolute inset-0 z-0 translate-y-2 rotate-1 rounded-2xl border border-black/6 bg-white/70 transition-transform duration-300 group-hover:translate-y-3 group-hover:rotate-2"
                style={{ boxShadow: "0 2px 8px -2px rgba(0,0,0,0.1)" }}
            />
            <div
                className="absolute inset-0 -z-10 translate-y-3 rotate-2 rounded-2xl border border-black/4 bg-white/40 transition-transform duration-300 group-hover:translate-y-5 group-hover:rotate-3"
            />
        </div>
    );
}
