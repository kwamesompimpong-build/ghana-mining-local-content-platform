import Link from "next/link";
import { Shield, Building2, ClipboardCheck, BarChart3, ShoppingCart, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-ghana-green" />
            <span className="text-lg font-bold text-ghana-green">GH Mining LCM</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="mx-auto max-w-3xl">
          <div className="mb-4 inline-flex items-center rounded-full border border-green-200 bg-green-50 px-4 py-1.5 text-sm text-green-700">
            L.I. 2431 Compliant Platform
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
            Ghana Mining{" "}
            <span className="text-ghana-green">Local Content</span>{" "}
            Management Platform
          </h1>
          <p className="mt-6 text-lg text-gray-600">
            The first purpose-built digital platform for tracking and managing local content
            compliance in Ghana&apos;s mining sector. Inspired by Nigeria&apos;s NOGIC JQS, configured
            for Minerals Commission regulations.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="h-12 px-8">
                Register Your Organization
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="h-12 px-8">
                Sign In to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-center text-3xl font-bold text-gray-900 mb-12">
          Comprehensive Local Content Management
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <Building2 className="h-10 w-10 text-ghana-green mb-2" />
              <CardTitle className="text-lg">Supplier Registration & Qualification</CardTitle>
              <CardDescription>
                Online contractor registration with capability verification, ownership documentation,
                and L.I. 2431 category classification.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <ClipboardCheck className="h-10 w-10 text-ghana-green mb-2" />
              <CardTitle className="text-lg">Compliance Tracking</CardTitle>
              <CardDescription>
                Automated compliance scoring for local spend ratios, Ghanaian ownership verification,
                and regulatory reporting to the Minerals Commission.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-10 w-10 text-ghana-green mb-2" />
              <CardTitle className="text-lg">Expatriate Quota Monitoring</CardTitle>
              <CardDescription>
                Track expatriate positions by category, monitor succession plans, and ensure
                compliance with approved quota limits.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <ShoppingCart className="h-10 w-10 text-ghana-green mb-2" />
              <CardTitle className="text-lg">E-Marketplace</CardTitle>
              <CardDescription>
                Procurement opportunities marketplace connecting mining companies with qualified local
                suppliers. Local content scoring for bid evaluation.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <BarChart3 className="h-10 w-10 text-ghana-green mb-2" />
              <CardTitle className="text-lg">Analytics & Reporting</CardTitle>
              <CardDescription>
                Real-time dashboards for local spend analytics, employment statistics, and compliance
                trend analysis across the mining sector.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-10 w-10 text-ghana-green mb-2" />
              <CardTitle className="text-lg">Regulatory Oversight</CardTitle>
              <CardDescription>
                Dedicated tools for the Minerals Commission to review supplier applications, audit
                compliance reports, and generate sector-wide analytics.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Stakeholders */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-3xl font-bold text-gray-900 mb-12">
            Built for All Stakeholders
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Mining Companies", desc: "Submit compliance reports, manage procurement, track expatriate quotas" },
              { title: "Suppliers & Contractors", desc: "Register capabilities, bid on opportunities, showcase local content credentials" },
              { title: "Minerals Commission", desc: "Review applications, audit compliance, generate sector-wide reports" },
              { title: "Platform Administrators", desc: "Manage users, configure L.I. 2431 parameters, oversee platform operations" },
            ].map((s) => (
              <Card key={s.title}>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
                  <p className="text-sm text-muted-foreground">{s.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Ghana Mining Local Content Management Platform</p>
          <p className="mt-1">
            Aligned with L.I. 2431 — Minerals and Mining (Local Content and Local Participation)
            Regulations, 2020
          </p>
        </div>
      </footer>
    </div>
  );
}
