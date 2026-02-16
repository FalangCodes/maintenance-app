import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Wrench, Clock, ShieldCheck } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      
      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 py-24">
        <div className="max-w-4xl space-y-8">
          
          <Badge className="bg-slate-200 text-slate-800 hover:bg-slate-200 mb-4 px-3 py-1 text-sm font-medium">
            Rise Student Living
          </Badge>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900">
            Digital Residence <br className="hidden sm:block" />
            <span className="text-slate-600">Maintenance Portal</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-600 leading-relaxed">
            A centralized, structured platform for reporting and tracking maintenance issues. 
            Ensuring a safe, functional, and accountable living environment for all residents.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/login">
              <Button size="lg" className="h-14 px-8 text-lg bg-slate-900 text-white hover:bg-slate-800 shadow-lg w-full sm:w-auto">
                Access System Portal <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Features / Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-24 text-left">
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-start space-y-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <Wrench className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Structured Reporting</h3>
            <p className="text-slate-500 leading-relaxed">
              Log issues precisely with our categorized dropdown system, ensuring the right maintenance team is dispatched with the correct urgency.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-start space-y-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-lg">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Real-Time Tracking</h3>
            <p className="text-slate-500 leading-relaxed">
              No more lost requests. Track the exact status of your maintenance logs from submission to resolution directly in your dashboard.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-start space-y-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Secure & Accountable</h3>
            <p className="text-slate-500 leading-relaxed">
              Fully authenticated role-based access for verified students and staff, complete with permanent audit trails for all administrative actions.
            </p>
          </div>

        </div>
      </main>
      
      {/* Subtle Footer */}
      <footer className="py-8 text-center text-sm text-slate-400 border-t border-slate-200 bg-white">
        <p>© {new Date().getFullYear()} Residence Maintenance Logging System. All rights reserved.</p>
      </footer>
    </div>
  );
}

// Quick fallback component definition so you don't have to import the Shadcn Badge manually if it throws an error
function Badge({ children, className }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}>
      {children}
    </span>
  );
}