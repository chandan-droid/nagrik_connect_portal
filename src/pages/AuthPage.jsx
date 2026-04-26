import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Shield,
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  Users,
  BarChart3,
  AlertCircle,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const roleRouteMap = {
  citizen: "/citizen",
  admin: "/admin",
  officer: "/officer"
};

const roleConfig = {
  citizen: {
    label: "Citizen",
    icon: Users,
    desc: "File & track grievances",
    color: "text-secondary",
    bg: "bg-secondary/10 border-secondary/30"
  },
  officer: {
    label: "Officer",
    icon: CheckCircle2,
    desc: "Manage & resolve cases",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/30"
  },
  admin: {
    label: "Admin",
    icon: BarChart3,
    desc: "Analytics & oversight",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/30"
  }
};

function PasswordStrength({ password }) {
  const checks = [
    { label: "At least 6 characters", pass: password.length >= 6 },
    { label: "Contains a number", pass: /\d/.test(password) },
    { label: "Contains uppercase", pass: /[A-Z]/.test(password) }
  ];
  const score = checks.filter((c) => c.pass).length;
  const colors = ["bg-destructive", "bg-accent", "bg-secondary"];
  const labels = ["Weak", "Fair", "Strong"];
  
  if (!password) return null;
  
  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {checks.map((_, i) => (
          <div key={i} className={cn("flex-1 h-1 rounded-full transition-all duration-300", i < score ? colors[score - 1] : "bg-border")} />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Strength: <span className={cn("font-medium", score === 1 ? "text-destructive" : score === 2 ? "text-accent" : "text-secondary")}>{labels[score - 1] || ""}</span>
      </p>
    </div>
  );
}

export default function AuthPage() {
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [loginRole, setLoginRole] = useState("citizen");
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({ email: "", password: "", fullName: "", phone: "" });
  const [errors, setErrors] = useState({});
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();

  const validate = (type) => {
    const errs = {};
    if (type === "login") {
      if (!loginForm.email) errs.email = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(loginForm.email)) errs.email = "Invalid email address";
      if (!loginForm.password) errs.password = "Password is required";
    } else {
      if (!signupForm.fullName.trim()) errs.fullName = "Full name is required";
      if (!signupForm.email) errs.email = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(signupForm.email)) errs.email = "Invalid email address";
      if (signupForm.password.length < 6) errs.password = "Password must be at least 6 characters";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validate("login")) return;
    setLoading(true);
    const { error, role } = await signIn({ email: loginForm.email, password: loginForm.password, role: loginRole });
    setLoading(false);
    if (error) {
      toast({ title: "Login Failed", description: error, variant: "destructive" });
    } else {
      const activeRole = role || loginRole;
      toast({ title: `Welcome back!`, description: `Signed in as ${roleConfig[activeRole].label}` });
      navigate(roleRouteMap[activeRole]);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!validate("signup")) return;
    setLoading(true);
    const { error } = await signUp({ email: signupForm.email, password: signupForm.password, fullName: signupForm.fullName, phone: signupForm.phone });
    setLoading(false);
    if (error) {
      toast({ title: "Sign Up Failed", description: error, variant: "destructive" });
    } else {
      toast({ title: "Account Created!", description: "You can now sign in from the Login tab." });
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      <div className="hidden lg:flex lg:w-[48%] gradient-hero relative items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-80 h-80 bg-secondary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
              backgroundSize: "48px 48px"
            }}
          />
        </div>
        <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="relative z-10 max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-8 backdrop-blur-sm">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-heading text-4xl font-extrabold text-white leading-[1.1] mb-4">
            Nagrik
            <br />
            <span className="text-secondary">Grievance Portal</span>
          </h1>
          <p className="text-white/60 text-lg leading-relaxed mb-10">Your voice matters. Report civic issues, track resolutions, and build a better community together.</p>
          <div className="grid grid-cols-3 gap-4 mb-10">
            {[{ val: "2.4L+", label: "Grievances Filed" }, { val: "< 7d", label: "Avg. Resolution" }, { val: "95%", label: "Satisfaction" }].map((s) => (
              <div key={s.label} className="text-center bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
                <p className="font-heading text-2xl font-bold text-secondary">{s.val}</p>
                <p className="text-xs text-white/40 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            {["End-to-end encrypted & secure", "Available 24×7 for citizens", "RTI compliant process"].map((t) => (
              <div key={t} className="flex items-center gap-2.5 text-sm text-white/60">
                <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" />
                {t}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative">
        <Link to="/" className="absolute top-6 left-6 md:top-8 md:left-8 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-heading font-bold text-lg text-foreground">Nagrik Grievance Portal</span>
          </div>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-7 h-11">
              <TabsTrigger value="login" className="font-semibold">Sign In</TabsTrigger>
              <TabsTrigger value="signup" className="font-semibold">Create Account</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <div className="mb-6">
                <h2 className="font-heading text-2xl font-bold text-foreground">Welcome back</h2>
                <p className="text-sm text-muted-foreground mt-1">Select your role and enter your credentials</p>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-6">
                {Object.keys(roleConfig).map((role) => {
                  const rc = roleConfig[role];
                  const active = loginRole === role;
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setLoginRole(role)}
                      className={cn(
                        "flex flex-col items-center gap-1 p-3 rounded-xl border-2 text-xs font-semibold transition-all duration-200",
                        active ? `${rc.bg} ${rc.color} border-current` : "border-border text-muted-foreground hover:border-border/70 hover:bg-muted/30"
                      )}
                    >
                      <rc.icon className={cn("w-4.5 h-4.5", active ? rc.color : "text-muted-foreground")} />
                      <span>{rc.label}</span>
                      <span className="text-[10px] font-normal opacity-70 hidden sm:block">{rc.desc}</span>
                    </button>
                  );
                })}
              </div>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="form-field">
                  <Label className="form-label">Email Address</Label>
                  <div className="relative mt-1.5">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      className={cn("pl-9 h-11", errors.email ? "border-destructive focus-visible:ring-destructive" : "")}
                      type="email"
                      placeholder="you@email.com"
                      value={loginForm.email}
                      onChange={(e) => {
                        setLoginForm({ ...loginForm, email: e.target.value });
                        setErrors({ ...errors, email: "" });
                      }}
                    />
                  </div>
                  {errors.email && (
                    <p className="form-error">
                      <AlertCircle className="w-3 h-3" />
                      {errors.email}
                    </p>
                  )}
                </div>
                <div className="form-field">
                  <Label className="form-label">Password</Label>
                  <div className="relative mt-1.5">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      className={cn("pl-9 pr-10 h-11", errors.password ? "border-destructive focus-visible:ring-destructive" : "")}
                      type={showPass ? "text" : "password"}
                      placeholder="••••••••"
                      value={loginForm.password}
                      onChange={(e) => {
                        setLoginForm({ ...loginForm, password: e.target.value });
                        setErrors({ ...errors, password: "" });
                      }}
                    />
                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" onClick={() => setShowPass(!showPass)}>
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="form-error">
                      <AlertCircle className="w-3 h-3" />
                      {errors.password}
                    </p>
                  )}
                </div>
                <div className="flex justify-end">
                  <button type="button" className="text-xs text-primary hover:underline">Forgot password?</button>
                </div>
                <Button type="submit" className="w-full h-11 gradient-primary text-white font-semibold shadow-md" disabled={loading}>
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Signing in...
                    </span>
                  ) : (
                    <>
                      <ArrowRight className="w-4 h-4 mr-1" />
                      Sign In as {roleConfig[loginRole].label}
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <div className="mb-6">
                <h2 className="font-heading text-2xl font-bold text-foreground">Create your account</h2>
                <p className="text-sm text-muted-foreground mt-1">Join millions of citizens making their voice heard</p>
              </div>
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="form-field">
                  <Label className="form-label">Full Name</Label>
                  <div className="relative mt-1.5">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      className={cn("pl-9 h-11", errors.fullName ? "border-destructive" : "")}
                      placeholder="Your full name"
                      value={signupForm.fullName}
                      onChange={(e) => {
                        setSignupForm({ ...signupForm, fullName: e.target.value });
                        setErrors({ ...errors, fullName: "" });
                      }}
                    />
                  </div>
                  {errors.fullName && (
                    <p className="form-error">
                      <AlertCircle className="w-3 h-3" />
                      {errors.fullName}
                    </p>
                  )}
                </div>
                <div className="form-field">
                  <Label className="form-label">Email Address</Label>
                  <div className="relative mt-1.5">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      className={cn("pl-9 h-11", errors.email ? "border-destructive" : "")}
                      type="email"
                      placeholder="you@email.com"
                      value={signupForm.email}
                      onChange={(e) => {
                        setSignupForm({ ...signupForm, email: e.target.value });
                        setErrors({ ...errors, email: "" });
                      }}
                    />
                  </div>
                  {errors.email && (
                    <p className="form-error">
                      <AlertCircle className="w-3 h-3" />
                      {errors.email}
                    </p>
                  )}
                </div>
                <div className="form-field">
                  <Label className="form-label">
                    Phone <span className="text-muted-foreground font-normal">(optional)</span>
                  </Label>
                  <div className="relative mt-1.5">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input className="pl-9 h-11" type="tel" placeholder="+91 XXXXX XXXXX" value={signupForm.phone} onChange={(e) => setSignupForm({ ...signupForm, phone: e.target.value })} />
                  </div>
                </div>
                <div className="form-field">
                  <Label className="form-label">Password</Label>
                  <div className="relative mt-1.5">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      className={cn("pl-9 h-11", errors.password ? "border-destructive" : "")}
                      type="password"
                      placeholder="Min 6 characters"
                      value={signupForm.password}
                      onChange={(e) => {
                        setSignupForm({ ...signupForm, password: e.target.value });
                        setErrors({ ...errors, password: "" });
                      }}
                    />
                  </div>
                  <PasswordStrength password={signupForm.password} />
                  {errors.password && (
                    <p className="form-error">
                      <AlertCircle className="w-3 h-3" />
                      {errors.password}
                    </p>
                  )}
                </div>
                <Button type="submit" className="w-full h-11 bg-secondary text-white hover:bg-secondary/90 font-semibold shadow-md" disabled={loading}>
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating account...
                    </span>
                  ) : (
                    <>
                      <ArrowRight className="w-4 h-4 mr-1" />
                      Create Account
                    </>
                  )}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  By registering, you agree to our <span className="text-primary underline cursor-pointer">Terms of Service</span> and <span className="text-primary underline cursor-pointer">Privacy Policy</span>.
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
