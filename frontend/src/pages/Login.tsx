import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthActions } from "@/hooks/useAuthActions";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone, Lock, LogIn } from "lucide-react";

const Login = () => {
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const { handleLogin, loading, error, clearError } = useAuthActions();

    const handleSubmit = async (e) => {
        e.preventDefault();
        clearError();
        await handleLogin(phone, password);
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <section className="relative overflow-hidden py-12 md:py-20">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-background z-0" />

                <div className="container relative z-10 max-w-md">
                    <div className="text-center mb-8">
                        <div className="inline-block p-3 rounded-full bg-primary/10 mb-4">
                            <LogIn className="w-8 h-8 text-primary" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                            Welcome{" "}
                            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                                Back
                            </span>
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            Login to access your account
                        </p>
                    </div>

                    <div className="bg-card rounded-2xl shadow-[var(--shadow-soft)] border border-border p-6 md:p-8">
                        {error && (
                            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg mb-6">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        id="phone"
                                        type="tel"
                                        required
                                        value={phone}
                                        onChange={(e) =>
                                            setPhone(e.target.value)
                                        }
                                        placeholder="Enter your phone number"
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                        placeholder="Enter your password"
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="remember"
                                        className="rounded border-border"
                                    />
                                    <label
                                        htmlFor="remember"
                                        className="text-sm text-muted-foreground cursor-pointer">
                                        Remember me
                                    </label>
                                </div>
                                <button
                                    type="button"
                                    className="text-sm text-primary hover:underline">
                                    Forgot password?
                                </button>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
                                disabled={loading}>
                                {loading ? "Logging in..." : "Login"}
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-muted-foreground">
                                Don't have an account?{" "}
                                <button
                                    onClick={() => navigate("/signup")}
                                    className="text-primary hover:underline font-medium">
                                    Sign up here
                                </button>
                            </p>
                        </div>

                        <div className="mt-6">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-border"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-card text-muted-foreground">
                                        Quick access for
                                    </span>
                                </div>
                            </div>

                            <div className="mt-4 grid grid-cols-3 gap-3">
                                <button
                                    type="button"
                                    className="py-2 px-4 border border-border rounded-lg text-sm font-medium hover:bg-muted/50 transition-colors">
                                    Patient
                                </button>
                                <button
                                    type="button"
                                    className="py-2 px-4 border border-border rounded-lg text-sm font-medium hover:bg-muted/50 transition-colors">
                                    Doctor
                                </button>
                                <button
                                    type="button"
                                    className="py-2 px-4 border border-border rounded-lg text-sm font-medium hover:bg-muted/50 transition-colors">
                                    Hospital
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Login;