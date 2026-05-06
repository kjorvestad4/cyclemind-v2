import { Outlet, Link, useLocation } from "react-router-dom";
import { CalendarDays, PenLine, BarChart3, BookOpen, User } from "lucide-react";

const NAV_ITEMS = [
  { path: "/", icon: CalendarDays, label: "Dashboard" },
  { path: "/log", icon: PenLine, label: "Log" },
  { path: "/insights", icon: BarChart3, label: "Insights" },
  { path: "/resources", icon: BookOpen, label: "Resources" },
  { path: "/profile", icon: User, label: "Profile" },
];

export default function AppLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary text-sm">🌙</span>
            </div>
            <h1 className="font-serif text-lg font-semibold text-foreground">CycleMind</h1>
          </Link>
          <p className="text-[10px] text-muted-foreground max-w-[140px] text-right leading-tight">
            Not medical advice. Always consult your doctor.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 pb-24">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-lg border-t border-border/50">
        <div className="max-w-2xl mx-auto flex justify-around py-2 px-2">
          {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.5} />
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}