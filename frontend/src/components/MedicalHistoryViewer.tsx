import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Calendar,
    FileText,
    Loader2,
    Clock,
    Activity,
    Pill,
    TestTube,
    User,
    Building2,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import { useMedicalRecordActions } from "@/hooks/useMedicalRecordActions";
import { toast } from "sonner";

const MedicalHistoryViewer = ({ patientId, viewMode = "patient" }) => {
    const { handleGetPatientMedicalHistory, handleGetProviderMedicalRecords } =
        useMedicalRecordActions();
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedRecord, setExpandedRecord] = useState(null);

    useEffect(() => {
        if (patientId) {
            fetchRecords();
        }
    }, [patientId]);

    const fetchRecords = async () => {
        setLoading(true);
        let result;

        try {
            if (viewMode === "patient") {
                result = await handleGetPatientMedicalHistory(patientId);
            } else {
                result = await handleGetProviderMedicalRecords(patientId);
            }

            console.log("API Response:", result); // Debug log

            if (result.success) {
                // Handle different response structures
                let fetchedRecords = [];

                if (result.data.records) {
                    // Structure: { success: true, data: { records: [...] } }
                    fetchedRecords = result.data.records;
                } else if (Array.isArray(result.data)) {
                    // Structure: { success: true, data: [...] }
                    fetchedRecords = result.data;
                } else if (
                    result.data.data &&
                    Array.isArray(result.data.data)
                ) {
                    // Structure: { success: true, data: { data: [...] } }
                    fetchedRecords = result.data.data;
                }

                console.log("Parsed Records:", fetchedRecords); // Debug log
                setRecords(fetchedRecords);
            } else {
                toast.error(result.error || "Failed to fetch medical records");
                setRecords([]);
            }
        } catch (error) {
            console.error("Error fetching records:", error);
            toast.error("Failed to fetch medical records");
            setRecords([]);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const formatTime = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (loading) {
        return (
            <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                    Loading medical records...
                </p>
            </div>
        );
    }

    if (!records || records.length === 0) {
        return (
            <Card className="p-8 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h4 className="text-lg font-semibold text-foreground mb-2">
                    No Medical Records Yet
                </h4>
                <p className="text-muted-foreground">
                    {viewMode === "patient"
                        ? "Your medical records will appear here once you visit a doctor"
                        : "No medical records found for this patient"}
                </p>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Medical History Timeline
                </h3>
                <Badge variant="outline">{records.length} Records</Badge>
            </div>

            {/* Timeline */}
            <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border" />

                {/* Timeline Items */}
                <div className="space-y-6">
                    {records.map((record, index) => (
                        <div
                            key={record._id || record.id}
                            className="relative pl-20">
                            {/* Timeline Dot */}
                            <div className="absolute left-6 top-6 w-5 h-5 rounded-full bg-primary border-4 border-background z-10" />

                            <Card className="overflow-hidden">
                                {/* Record Header */}
                                <div
                                    className="p-5 cursor-pointer hover:bg-muted/30 transition-colors"
                                    onClick={() =>
                                        setExpandedRecord(
                                            expandedRecord === record._id
                                                ? null
                                                : record._id
                                        )
                                    }>
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <Badge
                                                    variant="outline"
                                                    className="text-xs">
                                                    {record.recordNumber}
                                                </Badge>
                                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                    <Calendar className="h-3 w-3" />
                                                    {formatDate(
                                                        record.visitDate
                                                    )}
                                                </div>
                                                {index === 0 && (
                                                    <Badge
                                                        variant="default"
                                                        className="text-xs">
                                                        Latest
                                                    </Badge>
                                                )}
                                            </div>

                                            <h4 className="text-lg font-semibold text-foreground mb-2">
                                                {record.chiefComplaint ||
                                                    record.diagnosis?.[0]
                                                        ?.condition ||
                                                    "Consultation"}
                                            </h4>

                                            <div className="grid sm:grid-cols-2 gap-3 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-foreground">
                                                        Dr.{" "}
                                                        {record.doctorId
                                                            ?.name || "Unknown"}
                                                    </span>
                                                </div>
                                                {record.hospitalId && (
                                                    <div className="flex items-center gap-2">
                                                        <Building2 className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-foreground">
                                                            {
                                                                record
                                                                    .hospitalId
                                                                    ?.name
                                                            }
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="ml-4">
                                            {expandedRecord === record._id ? (
                                                <ChevronUp className="h-5 w-5" />
                                            ) : (
                                                <ChevronDown className="h-5 w-5" />
                                            )}
                                        </Button>
                                    </div>

                                    {/* Quick Summary */}
                                    {!expandedRecord ||
                                        (expandedRecord !== record._id && (
                                            <div className="flex gap-2 mt-3">
                                                {record.prescriptions?.length >
                                                    0 && (
                                                    <Badge
                                                        variant="secondary"
                                                        className="text-xs">
                                                        {
                                                            record.prescriptions
                                                                .length
                                                        }{" "}
                                                        Prescriptions
                                                    </Badge>
                                                )}
                                                {record.diagnosis?.length >
                                                    0 && (
                                                    <Badge
                                                        variant="secondary"
                                                        className="text-xs">
                                                        {
                                                            record.diagnosis
                                                                .length
                                                        }{" "}
                                                        Diagnosis
                                                    </Badge>
                                                )}
                                                {record.labTests?.length >
                                                    0 && (
                                                    <Badge
                                                        variant="secondary"
                                                        className="text-xs">
                                                        {record.labTests.length}{" "}
                                                        Lab Tests
                                                    </Badge>
                                                )}
                                            </div>
                                        ))}
                                </div>

                                {/* Expanded Details */}
                                {expandedRecord === record._id && (
                                    <div className="border-t bg-muted/20">
                                        <Tabs
                                            defaultValue="overview"
                                            className="p-5">
                                            <TabsList>
                                                <TabsTrigger value="overview">
                                                    Overview
                                                </TabsTrigger>
                                                <TabsTrigger value="vitals">
                                                    Vitals
                                                </TabsTrigger>
                                                <TabsTrigger value="treatment">
                                                    Treatment
                                                </TabsTrigger>
                                            </TabsList>

                                            {/* Overview Tab */}
                                            <TabsContent
                                                value="overview"
                                                className="space-y-4 mt-4">
                                                {/* Symptoms */}
                                                {record.symptoms &&
                                                    record.symptoms.length >
                                                        0 && (
                                                        <div>
                                                            <p className="text-sm font-medium text-muted-foreground mb-2">
                                                                Symptoms
                                                            </p>
                                                            <div className="flex flex-wrap gap-2">
                                                                {record.symptoms.map(
                                                                    (
                                                                        symptom,
                                                                        idx
                                                                    ) => (
                                                                        <Badge
                                                                            key={
                                                                                idx
                                                                            }
                                                                            variant="outline">
                                                                            {
                                                                                symptom
                                                                            }
                                                                        </Badge>
                                                                    )
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                {/* Diagnosis */}
                                                {record.diagnosis &&
                                                    record.diagnosis.length >
                                                        0 && (
                                                        <div>
                                                            <p className="text-sm font-medium text-muted-foreground mb-2">
                                                                Diagnosis
                                                            </p>
                                                            <div className="space-y-2">
                                                                {record.diagnosis.map(
                                                                    (
                                                                        diag,
                                                                        idx
                                                                    ) => (
                                                                        <Card
                                                                            key={
                                                                                idx
                                                                            }
                                                                            className="p-3">
                                                                            <div className="flex items-start justify-between">
                                                                                <div>
                                                                                    <p className="font-medium text-foreground">
                                                                                        {
                                                                                            diag.condition
                                                                                        }
                                                                                    </p>
                                                                                    {diag.notes && (
                                                                                        <p className="text-sm text-muted-foreground mt-1">
                                                                                            {
                                                                                                diag.notes
                                                                                            }
                                                                                        </p>
                                                                                    )}
                                                                                </div>
                                                                                <Badge
                                                                                    variant={
                                                                                        diag.severity ===
                                                                                        "critical"
                                                                                            ? "destructive"
                                                                                            : diag.severity ===
                                                                                              "severe"
                                                                                            ? "default"
                                                                                            : "secondary"
                                                                                    }>
                                                                                    {
                                                                                        diag.severity
                                                                                    }
                                                                                </Badge>
                                                                            </div>
                                                                        </Card>
                                                                    )
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                {/* Clinical Notes */}
                                                {record.clinicalNotes && (
                                                    <div>
                                                        <p className="text-sm font-medium text-muted-foreground mb-2">
                                                            Clinical Notes
                                                        </p>
                                                        <Card className="p-3">
                                                            <p className="text-sm text-foreground">
                                                                {
                                                                    record.clinicalNotes
                                                                }
                                                            </p>
                                                        </Card>
                                                    </div>
                                                )}
                                            </TabsContent>

                                            {/* Vitals Tab */}
                                            <TabsContent
                                                value="vitals"
                                                className="space-y-4 mt-4">
                                                {record.vitalSigns &&
                                                Object.keys(record.vitalSigns)
                                                    .length > 0 ? (
                                                    <div className="grid sm:grid-cols-2 gap-4">
                                                        {record.vitalSigns
                                                            .bloodPressure && (
                                                            <Card className="p-4">
                                                                <p className="text-xs text-muted-foreground mb-1">
                                                                    Blood
                                                                    Pressure
                                                                </p>
                                                                <p className="text-xl font-semibold">
                                                                    {
                                                                        record
                                                                            .vitalSigns
                                                                            .bloodPressure
                                                                    }
                                                                </p>
                                                            </Card>
                                                        )}
                                                        {record.vitalSigns
                                                            .heartRate && (
                                                            <Card className="p-4">
                                                                <p className="text-xs text-muted-foreground mb-1">
                                                                    Heart Rate
                                                                </p>
                                                                <p className="text-xl font-semibold">
                                                                    {
                                                                        record
                                                                            .vitalSigns
                                                                            .heartRate
                                                                    }{" "}
                                                                    bpm
                                                                </p>
                                                            </Card>
                                                        )}
                                                        {record.vitalSigns
                                                            .temperature && (
                                                            <Card className="p-4">
                                                                <p className="text-xs text-muted-foreground mb-1">
                                                                    Temperature
                                                                </p>
                                                                <p className="text-xl font-semibold">
                                                                    {
                                                                        record
                                                                            .vitalSigns
                                                                            .temperature
                                                                    }
                                                                    °F
                                                                </p>
                                                            </Card>
                                                        )}
                                                        {record.vitalSigns
                                                            .spo2 && (
                                                            <Card className="p-4">
                                                                <p className="text-xs text-muted-foreground mb-1">
                                                                    SpO2
                                                                </p>
                                                                <p className="text-xl font-semibold">
                                                                    {
                                                                        record
                                                                            .vitalSigns
                                                                            .spo2
                                                                    }
                                                                    %
                                                                </p>
                                                            </Card>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-muted-foreground text-center py-8">
                                                        No vital signs recorded
                                                    </p>
                                                )}
                                            </TabsContent>

                                            {/* Treatment Tab */}
                                            <TabsContent
                                                value="treatment"
                                                className="space-y-4 mt-4">
                                                {/* Prescriptions */}
                                                {record.prescriptions &&
                                                    record.prescriptions
                                                        .length > 0 && (
                                                        <div>
                                                            <p className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                                                                <Pill className="h-4 w-4" />
                                                                Prescriptions
                                                            </p>
                                                            <div className="space-y-2">
                                                                {record.prescriptions.map(
                                                                    (
                                                                        med,
                                                                        idx
                                                                    ) => (
                                                                        <Card
                                                                            key={
                                                                                idx
                                                                            }
                                                                            className="p-4">
                                                                            <div className="flex justify-between items-start">
                                                                                <div>
                                                                                    <p className="font-medium text-foreground">
                                                                                        {
                                                                                            med.medication
                                                                                        }
                                                                                    </p>
                                                                                    <p className="text-sm text-muted-foreground mt-1">
                                                                                        {
                                                                                            med.dosage
                                                                                        }{" "}
                                                                                        •{" "}
                                                                                        {
                                                                                            med.frequency
                                                                                        }{" "}
                                                                                        •{" "}
                                                                                        {
                                                                                            med.duration
                                                                                        }
                                                                                    </p>
                                                                                    {med.instructions && (
                                                                                        <p className="text-xs text-muted-foreground mt-2">
                                                                                            {
                                                                                                med.instructions
                                                                                            }
                                                                                        </p>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </Card>
                                                                    )
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                {/* Lab Tests */}
                                                {record.labTests &&
                                                    record.labTests.length >
                                                        0 && (
                                                        <div>
                                                            <p className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                                                                <TestTube className="h-4 w-4" />
                                                                Lab Tests
                                                            </p>
                                                            <div className="space-y-2">
                                                                {record.labTests.map(
                                                                    (
                                                                        test,
                                                                        idx
                                                                    ) => (
                                                                        <Card
                                                                            key={
                                                                                idx
                                                                            }
                                                                            className="p-4">
                                                                            <p className="font-medium text-foreground">
                                                                                {
                                                                                    test.testName
                                                                                }
                                                                            </p>
                                                                            {test.result && (
                                                                                <p className="text-sm text-foreground mt-1">
                                                                                    Result:{" "}
                                                                                    {
                                                                                        test.result
                                                                                    }
                                                                                </p>
                                                                            )}
                                                                            {test.normalRange && (
                                                                                <p className="text-xs text-muted-foreground mt-1">
                                                                                    Normal
                                                                                    Range:{" "}
                                                                                    {
                                                                                        test.normalRange
                                                                                    }
                                                                                </p>
                                                                            )}
                                                                        </Card>
                                                                    )
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                {/* Follow-up */}
                                                {record.followUp?.required && (
                                                    <Card className="p-4 bg-blue-50 border-blue-200">
                                                        <p className="text-sm font-medium text-foreground mb-2">
                                                            Follow-up Required
                                                        </p>
                                                        {record.followUp
                                                            .date && (
                                                            <p className="text-sm text-muted-foreground">
                                                                Date:{" "}
                                                                {formatDate(
                                                                    record
                                                                        .followUp
                                                                        .date
                                                                )}
                                                            </p>
                                                        )}
                                                        {record.followUp
                                                            .instructions && (
                                                            <p className="text-sm text-muted-foreground mt-1">
                                                                {
                                                                    record
                                                                        .followUp
                                                                        .instructions
                                                                }
                                                            </p>
                                                        )}
                                                    </Card>
                                                )}
                                            </TabsContent>
                                        </Tabs>
                                    </div>
                                )}
                            </Card>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MedicalHistoryViewer;
