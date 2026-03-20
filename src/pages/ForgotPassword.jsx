import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sprout, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Please enter your email");
      return;
    }

    // Simulate password reset
    setTimeout(() => {
      setSubmitted(true);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-[#1B2B5E] rounded-2xl flex items-center justify-center shadow-lg">
              <Sprout className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Sprout</h1>
              <p className="text-sm text-gray-500">Grow Your Knowledge</p>
            </div>
          </div>
        </div>

        <Card className="border-none shadow-2xl bg-white/80 backdrop-blur-xl">
          <CardHeader className="space-y-1 text-center pb-6">
            {!submitted ? (
              <>
                <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
                <CardDescription className="text-base">
                  Enter your email and we'll send you a reset link
                </CardDescription>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-gradient-to-br bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-[#2D9B6F]" />
                </div>
                <CardTitle className="text-2xl font-bold">Check Your Email</CardTitle>
                <CardDescription className="text-base">
                  We've sent password reset instructions to {email}
                </CardDescription>
              </>
            )}
          </CardHeader>

          <CardContent>
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@school.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-12 border-gray-200 focus:ring-[#1B2B5E]"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-[#1B2B5E] hover:bg-[#141E43] text-white font-semibold shadow-lg "
                >
                  Send Reset Link
                </Button>

                <Link to={createPageUrl("Login")}>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 mt-2"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Login
                  </Button>
                </Link>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-gradient-to-r bg-[#E6F5EF] border border-[#2D9B6F]">
                  <p className="text-sm text-gray-700">
                    📧 Didn't receive the email? Check your spam folder or try again in a few minutes.
                  </p>
                </div>

                <Link to={createPageUrl("Login")}>
                  <Button
                    className="w-full h-12 bg-[#1B2B5E] hover:bg-[#141E43] text-white"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Login
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
