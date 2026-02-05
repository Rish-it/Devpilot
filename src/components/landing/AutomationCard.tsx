interface AutomationCardProps {
    title: string;
    description: string;
    badge: string;
    icon?: string;
}

export function AutomationCard({ title, description, badge }: AutomationCardProps) {
    return (
        <div className="relative group cursor-pointer">
            <div className="relative z-10 flex flex-col h-40 rounded-2xl border border-[#e6e2d9]/50 bg-card px-5 py-4 shadow-lg transition-transform duration-300 group-hover:-translate-y-1">
                <div className="landing-card-badge mb-3 w-fit">{badge}</div>
                <h2 className="text-base font-semibold text-foreground mb-1.5">{title}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
            </div>

            <div className="absolute inset-0 z-0 translate-y-2 rotate-1 rounded-2xl border border-[#e6e2d9]/40 bg-[#f0ede4]/50 transition-transform duration-300 group-hover:translate-y-3 group-hover:rotate-2" />
            <div className="absolute inset-0 -z-10 translate-y-3 rotate-2 rounded-2xl border border-[#e6e2d9]/30 bg-[#f0ede4]/30 transition-transform duration-300 group-hover:translate-y-5 group-hover:rotate-3" />
        </div>
    );
}
