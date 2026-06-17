import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Check, Zap, Users, Sparkles } from "lucide-react";
import { useSearch } from "wouter";
import { useEffect } from "react";
import { toast } from "@/hooks/use-toast";

const FREE_FEATURES = [
  "Up to 3 active roles",
  "10 AI screenings per month",
  "AI job description generation",
  "AI interview question generation",
  "AI recruitment email drafting",
  "Candidate pipeline tracking",
];

const STARTER_FEATURES = [
  "Unlimited active roles",
  "50 AI screenings per month",
  "Everything in Free",
  "AI candidate profile parsing",
  "Analytics dashboard",
  "Email support",
];

const PRO_FEATURES = [
  "Unlimited roles & screenings",
  "Batch AI screening",
  "Everything in Starter",
  "Priority AI processing",
  "Advanced analytics",
  "Priority support",
];

const PLANS = [
  {
    name: "Free",
    icon: Users,
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: "Get started with AI recruitment at no cost.",
    features: FREE_FEATURES,
    cta: "Get started free",
    variant: "outline" as const,
    badge: null,
    priceIdMonthly: null,
    priceIdYearly: null,
  },
  {
    name: "Starter",
    icon: Zap,
    monthlyPrice: 9,
    yearlyPrice: 72,
    description: "For individual recruiters running active hiring pipelines.",
    features: STARTER_FEATURES,
    cta: "Start Starter",
    variant: "default" as const,
    badge: "Most popular",
    priceIdMonthly: "__STARTER_MONTHLY__",
    priceIdYearly: "__STARTER_YEARLY__",
  },
  {
    name: "Pro",
    icon: Sparkles,
    monthlyPrice: 19,
    yearlyPrice: 152,
    description: "For growing teams with high-volume hiring needs.",
    features: PRO_FEATURES,
    cta: "Start Pro",
    variant: "default" as const,
    badge: null,
    priceIdMonthly: "__PRO_MONTHLY__",
    priceIdYearly: "__PRO_YEARLY__",
  },
];

export default function Pricing() {
  const [yearly, setYearly] = useState(false);
  const [email, setEmail] = useState("");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [showEmail, setShowEmail] = useState<string | null>(null);
  const search = useSearch();

  useEffect(() => {
    if (search.includes("checkout=cancelled")) {
      toast({ title: "Checkout cancelled", description: "No charge was made.", variant: "default" });
    }
  }, [search]);

  async function handleCheckout(plan: typeof PLANS[number]) {
    if (plan.monthlyPrice === 0) return;
    if (!showEmail) {
      setShowEmail(plan.name);
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      toast({ title: "Enter a valid email", variant: "destructive" });
      return;
    }

    const priceId = yearly ? plan.priceIdYearly : plan.priceIdMonthly;
    if (!priceId || priceId.startsWith("__")) {
      toast({
        title: "Plans not yet seeded",
        description: "Run the seed-products script first to create Stripe products.",
        variant: "destructive",
      });
      return;
    }

    setLoadingPlan(plan.name);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, email: email.trim() }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast({ title: "Error", description: data.error || "Checkout failed", variant: "destructive" });
      }
    } catch {
      toast({ title: "Network error", description: "Could not reach the server", variant: "destructive" });
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
    <div className="space-y-10 max-w-4xl">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-bold tracking-tight">Simple, affordable pricing</h1>
        <p className="text-muted-foreground">
          Start free. Upgrade as your hiring needs grow.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <span className={`text-sm ${!yearly ? "font-medium" : "text-muted-foreground"}`}>Monthly</span>
          <Switch checked={yearly} onCheckedChange={setYearly} />
          <span className={`text-sm ${yearly ? "font-medium" : "text-muted-foreground"}`}>
            Yearly <Badge variant="secondary" className="ml-1 text-xs">Save ~20%</Badge>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => {
          const Icon = plan.icon;
          const price = yearly ? plan.yearlyPrice : plan.monthlyPrice;
          const isActive = showEmail === plan.name;

          return (
            <Card
              key={plan.name}
              className={`relative flex flex-col ${plan.badge ? "border-primary shadow-md" : ""}`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="px-3 py-1">{plan.badge}</Badge>
                </div>
              )}
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                    <Icon className="w-4 h-4 text-primary" />
                  </span>
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                </div>
                <div className="flex items-end gap-1 mt-2">
                  <span className="text-3xl font-bold">
                    {price === 0 ? "Free" : `$${price}`}
                  </span>
                  {price > 0 && (
                    <span className="text-muted-foreground text-sm mb-1">
                      /{yearly ? "yr" : "mo"}
                    </span>
                  )}
                </div>
                <CardDescription className="mt-1">{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="flex flex-col flex-1 gap-4">
                <ul className="space-y-2 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                {isActive && plan.monthlyPrice > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor={`email-${plan.name}`} className="text-sm">Your email</Label>
                    <Input
                      id={`email-${plan.name}`}
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleCheckout(plan)}
                      autoFocus
                    />
                  </div>
                )}

                <Button
                  variant={plan.variant}
                  className="w-full"
                  onClick={() => handleCheckout(plan)}
                  disabled={loadingPlan === plan.name}
                >
                  {loadingPlan === plan.name
                    ? "Redirecting..."
                    : isActive && plan.monthlyPrice > 0
                    ? "Continue to checkout →"
                    : plan.cta}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="text-center text-sm text-muted-foreground space-y-1 pb-8">
        <p>All paid plans include a <strong>7-day free trial</strong>. Cancel anytime. No long-term contracts.</p>
        <p>Payments are securely processed by Stripe. We never store your card details.</p>
      </div>
    </div>
  );
}
