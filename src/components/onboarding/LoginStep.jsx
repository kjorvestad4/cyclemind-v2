import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, Lock, Chrome } from "lucide-react";

export default function LoginStep({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Attempt email/password login via Base44 SDK
      await base44.auth.loginWithEmail(email, password);
      
      // After login, check if user is onboarded and has a cycle
      const user = await base44.auth.me();
      
      if (user?.onboarded) {
        const cycles = await base44.entities.Cycle.filter(
          { created_by: user.email },
          "-start_date",
          1
        );
        
        if (cycles.length > 0) {
          // User is fully onboarded with a cycle → go to main Dashboard
          window.location.href = "/";
          return;
        }
      }
      
      // User is not onboarded or has no cycle → proceed to onboarding flow
      toast.success("Logged in! Let's set up your account.");
      onLoginSuccess();
    } catch (err) {
      console.error("Login error:", err);
      setError("Incorrect email or password. Please try again.");
      toast.error("Incorrect email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    
    try {
      // Redirect to Google login via Base44 SDK
      await base44.auth.loginWithGoogle();
      
      // After Google login returns, check onboarded status
      const user = await base44.auth.me();
      
      if (user?.onboarded) {
        const cycles = await base44.entities.Cycle.filter(
          { created_by: user.email },
          "-start_date",
          1
        );
        
        if (cycles.length > 0) {
          // User is fully onboarded with a cycle → go to main Dashboard
          window.location.href = "/";
          return;
        }
      }
      
      // User is not onboarded or has no cycle → proceed to onboarding flow
      toast.success("Logged in! Let's set up your account.");
      onLoginSuccess();
    } catch (err) {
      console.error("Google login error:", err);
      setError("Google login failed. Please try again.");
      toast.error("Google login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-8 text-center max-w-md mx-auto w-full">
      <div className="space-y-3">
        <h1 className="font-serif text-3xl font-semibold text-foreground">
          Welcome to CycleMind
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The app that supports your full hormonal journey from PMDD to pregnancy to menopause.
        </p>
      </div>

      <form onSubmit={handleEmailLogin} className="w-full space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm font-semibold">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="h-10 text-base"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            className="h-10 text-base"
            required
          />
        </div>

        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-3">
            <p className="text-sm text-destructive font-medium">{error}</p>
          </div>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-11 rounded-2xl font-semibold text-base gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              <Mail className="w-4 h-4" />
              Sign In
            </>
          )}
        </Button>
      </form>

      <div className="relative w-full">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border/40" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or</span>
        </div>
      </div>

      <Button
        onClick={handleGoogleLogin}
        disabled={loading}
        variant="outline"
        className="w-full h-11 rounded-2xl font-semibold text-base gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <Chrome className="w-4 h-4" />
            Sign in with Google
          </>
        )}
      </Button>

      <p className="text-xs text-muted-foreground">
        Don't have an account?{" "}
        <button
          onClick={() => base44.auth.redirectToLogin("/start")}
          className="text-primary hover:underline font-medium"
        >
          Sign up
        </button>
      </p>
    </div>
  );
}