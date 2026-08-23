import { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuthActions } from "@/hooks/useAuthActions";
import { useLocation } from "react-router-dom";

import { UploadCloud, FileText, ShieldCheck, X } from "lucide-react";
import { toast } from "sonner";

export default function UploadVerificationDocs() {
    const navigate = useNavigate();
    const { handleUploadVerificationDocs, loading } = useAuthActions();
    const location = useLocation();
    const { userId } = location.state || {};

    const [files, setFiles] = useState<File[]>([]);

    useEffect(() => {
        if (!userId) navigate("/");
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = Array.from(e.target.files || []);
        setFiles([...files, ...selected]);
    };

    const removeFile = (index: number) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    const submit = async () => {
        if (files.length === 0) {
            toast.error("Please upload at least one verification document");
            return;
        }

        const res = await handleUploadVerificationDocs(userId,files);

        if (res.success) {
            toast.success("Documents submitted. Admin will verify shortly.");
            navigate("/");
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <section className="relative overflow-hidden py-12 md:py-16">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-background" />

                <div className="container relative max-w-4xl">
                    <div className="text-center mb-10">
                        <div className="flex justify-center mb-4">
                            <ShieldCheck className="h-14 w-14 text-primary" />
                        </div>

                        <h1 className="text-4xl font-bold mb-3">
                            Verify Your Identity
                        </h1>

                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            To protect patients from fake hospitals and doctors,
                            we require official documents before your account
                            goes live.
                        </p>
                    </div>

                    <Card className="p-8 border shadow-xl">
                        <div className="space-y-6">
                            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                                <h3 className="font-semibold mb-2">
                                    Required Documents
                                </h3>
                                <ul className="text-sm text-muted-foreground list-disc ml-5 space-y-1">
                                    <li>Medical License / Registration</li>
                                    <li>Hospital Registration Certificate</li>
                                    <li>Government ID (Aadhaar, PAN, etc)</li>
                                    <li>Any proof of practice or ownership</li>
                                </ul>
                            </div>

                            {/* Upload Box */}
                            <div className="border-2 border-dashed border-primary/30 rounded-xl p-8 text-center hover:bg-primary/5 transition">
                                <UploadCloud className="h-12 w-12 mx-auto text-primary mb-4" />
                                <p className="font-medium mb-1">
                                    Upload verification documents
                                </p>
                                <p className="text-sm text-muted-foreground mb-4">
                                    PDF, JPG or PNG. Max 5 files.
                                </p>

                                <Input
                                    type="file"
                                    multiple
                                    onChange={handleFileSelect}
                                    className="cursor-pointer"
                                />
                            </div>

                            {/* File list */}
                            {files.length > 0 && (
                                <div className="space-y-3">
                                    <h4 className="font-semibold">
                                        Selected Files
                                    </h4>

                                    {files.map((file, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                                            <div className="flex items-center gap-3">
                                                <FileText className="h-5 w-5 text-primary" />
                                                <div>
                                                    <p className="text-sm font-medium">
                                                        {file.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {(
                                                            file.size / 1024
                                                        ).toFixed(1)}{" "}
                                                        KB
                                                    </p>
                                                </div>
                                            </div>

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    removeFile(index)
                                                }>
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Submit */}
                            <div className="pt-6">
                                <Button
                                    onClick={submit}
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-lg py-6">
                                    {loading
                                        ? "Submitting Documents..."
                                        : "Submit for Verification"}
                                </Button>
                            </div>

                            <div className="text-center text-sm text-muted-foreground">
                                Verification usually takes less than 24 hours
                            </div>
                        </div>
                    </Card>
                </div>
            </section>
        </div>
    );
}
