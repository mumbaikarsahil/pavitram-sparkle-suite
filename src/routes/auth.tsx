import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/site/Logo";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — Pavitram" }] }),
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back");
      } else {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin, data: { full_name: name } },
        });
        if (error) throw error;
        toast.success("Account created");
      }
      navigate({ to: "/account" });
    } catch (err: any) {
      toast.error(err.message ?? "Something went wrong");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[image:var(--gradient-ivory)]">
      <div className="hidden lg:flex flex-col justify-between p-12 bg-[color:var(--plum-deep)] text-[color:var(--ivory)]">
        <div className="bg-[color:var(--ivory)] rounded-xl p-3 self-start"><Logo className="h-10" /></div>
        <div>
          <h1 className="font-serif text-4xl leading-tight">Timeless elegance.<br/>Crafted for you.</h1>
          <p className="mt-4 text-[color:var(--ivory)]/70 max-w-md">Sign in to track orders, save your wishlist and access exclusive Pavitram experiences.</p>
        </div>
        <p className="text-xs text-[color:var(--ivory)]/50">© Pavitram Diamond Jewellery · Since 1990</p>
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 text-center"><Logo className="h-12 mx-auto" /></div>
          <h2 className="font-serif text-3xl">{mode === "signin" ? "Welcome back" : "Create account"}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === "signin" ? "Sign in to your Pavitram account" : "Join the Pavitram family"}
          </p>
          <div className="gold-divider w-20 my-6" />
          <form onSubmit={submit} className="space-y-4">
            {mode === "signup" && (
              <Field label="Full Name" value={name} onChange={setName} type="text" />
            )}
            <Field label="Email" value={email} onChange={setEmail} type="email" />
            <Field label="Password" value={password} onChange={setPassword} type="password" />
            <button disabled={loading} className="w-full rounded-full bg-primary text-primary-foreground py-3.5 text-sm font-medium hover:shadow-[var(--shadow-card)] disabled:opacity-60">
              {loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>
          <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="mt-6 text-sm text-[color:var(--plum)] hover:underline">
            {mode === "signin" ? "New to Pavitram? Create an account" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
function Field({ label, value, onChange, type }: { label: string; value: string; onChange: (v: string) => void; type: string }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-widest text-muted-foreground">{label}</span>
      <input required type={type} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1.5 w-full rounded-md border hairline bg-card px-3 py-2.5 text-sm outline-none focus:border-[color:var(--plum)]" />
    </label>
  );
}
