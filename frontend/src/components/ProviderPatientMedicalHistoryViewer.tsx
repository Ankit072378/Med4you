import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Loader2,
    AlertCircle,
    Pill,
    Syringe,
    Users,
    HeartPulse,
    Activity,
    Briefcase,
    Scissors,
    Cigarette,
    Wine,
    User,
    Droplet,
    FileText,
} from "lucide-react";
import { useMedicalRecordActions } from "@/hooks/useMedicalRecordActions";
import { toast } from "sonner";

const ProviderPatientMedicalHistoryViewer = ({ patientId }) => {
    const { handleGetPatientMedicalHistoryForProvider } =
        useMedicalRecordActions();
    const [medicalHistory, setMedicalHistory] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMedicalHistory();
    }, [patientId]);

    const fetchMedicalHistory = async () => {
        setLoading(true);
        const result = await handleGetPatientMedicalHistoryForProvider(
            patientId
        );
        if (result.success) {
            setMedicalHistory(result.data);
        } else {
            toast.error(
                result.error || "Failed to fetch patient medical history"
            );
        }
        setLoading(false);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    if (loading) {
        return (
            <Card className="p-12">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">
                        Loading patient medical history...
                    </p>
                </div>
            </Card>
        );
    }

    if (!medicalHistory) {
        return (
            <Card className="p-12 text-center">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                    No Medical History Available
                </h3>
                <p className="text-muted-foreground">
                    Patient has not created their medical history yet.
                </p>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Basic Information */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                    <User className="h-5 w-5 mr-2 text-primary" />
                    Patient Information
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded">
                        <span className="text-sm text-muted-foreground">
                            Blood Type
                        </span>
                        <Badge variant="secondary">
                            {medicalHistory.bloodType}
                        </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded">
                        <span className="text-sm text-muted-foreground">
                            Total Visits
                        </span>
                        <Badge variant="outline">
                            {medicalHistory.statistics?.totalVisits || 0}
                        </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded">
                        <span className="text-sm text-muted-foreground">
                            Prescriptions
                        </span>
                        <Badge variant="outline">
                            {medicalHistory.statistics?.totalPrescriptions || 0}
                        </Badge>
                    </div>
                </div>
            </Card>

            <Tabs defaultValue="conditions" className="space-y-4">
                <TabsList className="w-full justify-start">
                    <TabsTrigger value="conditions">
                        <HeartPulse className="h-4 w-4 mr-2" />
                        Conditions
                    </TabsTrigger>
                    <TabsTrigger value="allergies">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Allergies
                    </TabsTrigger>
                    <TabsTrigger value="medications">
                        <Pill className="h-4 w-4 mr-2" />
                        Medications
                    </TabsTrigger>
                    <TabsTrigger value="history">
                        <Activity className="h-4 w-4 mr-2" />
                        History
                    </TabsTrigger>
                    <TabsTrigger value="lifestyle">
                        <Briefcase className="h-4 w-4 mr-2" />
                        Lifestyle
                    </TabsTrigger>
                </TabsList>

                {/* Chronic Conditions */}
                <TabsContent value="conditions">
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">
                                Chronic Conditions
                            </h3>
                            {medicalHistory.chronicConditions?.length > 0 && (
                                <Badge variant="secondary">
                                    {medicalHistory.chronicConditions.length}
                                </Badge>
                            )}
                        </div>
                        {medicalHistory.chronicConditions?.length > 0 ? (
                            <div className="space-y-3">
                                {medicalHistory.chronicConditions.map(
                                    (condition, idx) => (
                                        <div
                                            key={idx}
                                            className="p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <p className="font-medium text-foreground">
                                                        {condition.condition}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        Diagnosed:{" "}
                                                        {formatDate(
                                                            condition.diagnosedDate
                                                        )}
                                                    </p>
                                                    {condition.managementPlan && (
                                                        <p className="text-sm text-muted-foreground mt-2">
                                                            {
                                                                condition.managementPlan
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                                <Badge
                                                    variant={
                                                        condition.status ===
                                                        "managed"
                                                            ? "secondary"
                                                            : condition.status ===
                                                              "active"
                                                            ? "destructive"
                                                            : "outline"
                                                    }
                                                    className="capitalize ml-2">
                                                    {condition.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        ) : (
                            <p className="text-center py-8 text-muted-foreground">
                                No chronic conditions recorded
                            </p>
                        )}
                    </Card>
                </TabsContent>

                {/* Allergies */}
                <TabsContent value="allergies">
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Allergies</h3>
                            {medicalHistory.allergies?.length > 0 && (
                                <Badge variant="destructive">
                                    {medicalHistory.allergies.length}
                                </Badge>
                            )}
                        </div>
                        {medicalHistory.allergies?.length > 0 ? (
                            <div className="space-y-3">
                                {medicalHistory.allergies.map(
                                    (allergy, idx) => (
                                        <div
                                            key={idx}
                                            className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                                            <p className="font-medium text-foreground">
                                                {allergy.allergen}
                                            </p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <Badge
                                                    variant="outline"
                                                    className="text-xs capitalize">
                                                    {allergy.type}
                                                </Badge>
                                                <Badge
                                                    variant={
                                                        allergy.severity ===
                                                            "life_threatening" ||
                                                        allergy.severity ===
                                                            "severe"
                                                            ? "destructive"
                                                            : "secondary"
                                                    }
                                                    className="text-xs capitalize">
                                                    {allergy.severity.replace(
                                                        "_",
                                                        " "
                                                    )}
                                                </Badge>
                                            </div>
                                            {allergy.reaction && (
                                                <p className="text-sm text-muted-foreground mt-2">
                                                    Reaction: {allergy.reaction}
                                                </p>
                                            )}
                                        </div>
                                    )
                                )}
                            </div>
                        ) : (
                            <p className="text-center py-8 text-muted-foreground">
                                No allergies recorded
                            </p>
                        )}
                    </Card>
                </TabsContent>

                {/* Current Medications */}
                <TabsContent value="medications">
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">
                                Current Medications
                            </h3>
                            {medicalHistory.currentMedications?.length > 0 && (
                                <Badge variant="secondary">
                                    {medicalHistory.currentMedications.length}
                                </Badge>
                            )}
                        </div>
                        {medicalHistory.currentMedications?.length > 0 ? (
                            <div className="grid md:grid-cols-2 gap-4">
                                {medicalHistory.currentMedications.map(
                                    (medication, idx) => (
                                        <div
                                            key={idx}
                                            className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                                            <p className="font-medium text-foreground">
                                                {medication.medication}
                                            </p>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {medication.dosage} •{" "}
                                                {medication.frequency}
                                            </p>
                                            {medication.reason && (
                                                <p className="text-xs text-muted-foreground mt-2">
                                                    For: {medication.reason}
                                                </p>
                                            )}
                                            {medication.prescribedBy && (
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Prescribed by:{" "}
                                                    {medication.prescribedBy}
                                                </p>
                                            )}
                                        </div>
                                    )
                                )}
                            </div>
                        ) : (
                            <p className="text-center py-8 text-muted-foreground">
                                No current medications
                            </p>
                        )}
                    </Card>
                </TabsContent>

                {/* Medical History */}
                <TabsContent value="history">
                    <div className="space-y-4">
                        {/* Surgeries */}
                        <Card className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold flex items-center">
                                    <Scissors className="h-5 w-5 mr-2 text-blue-500" />
                                    Past Surgeries
                                </h3>
                                {medicalHistory.surgeries?.length > 0 && (
                                    <Badge variant="secondary">
                                        {medicalHistory.surgeries.length}
                                    </Badge>
                                )}
                            </div>
                            {medicalHistory.surgeries?.length > 0 ? (
                                <div className="space-y-3">
                                    {medicalHistory.surgeries.map(
                                        (surgery, idx) => (
                                            <div
                                                key={idx}
                                                className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                                <p className="font-medium text-foreground">
                                                    {surgery.procedure}
                                                </p>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {formatDate(surgery.date)} •{" "}
                                                    {surgery.hospital}
                                                </p>
                                                {surgery.surgeon && (
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Surgeon:{" "}
                                                        {surgery.surgeon}
                                                    </p>
                                                )}
                                                {surgery.notes && (
                                                    <p className="text-xs text-muted-foreground mt-2">
                                                        {surgery.notes}
                                                    </p>
                                                )}
                                            </div>
                                        )
                                    )}
                                </div>
                            ) : (
                                <p className="text-center py-6 text-muted-foreground">
                                    No past surgeries recorded
                                </p>
                            )}
                        </Card>

                        {/* Immunizations */}
                        <Card className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold flex items-center">
                                    <Syringe className="h-5 w-5 mr-2 text-purple-500" />
                                    Immunizations
                                </h3>
                                {medicalHistory.immunizations?.length > 0 && (
                                    <Badge variant="secondary">
                                        {medicalHistory.immunizations.length}
                                    </Badge>
                                )}
                            </div>
                            {medicalHistory.immunizations?.length > 0 ? (
                                <div className="grid md:grid-cols-2 gap-3">
                                    {medicalHistory.immunizations.map(
                                        (immunization, idx) => (
                                            <div
                                                key={idx}
                                                className="p-3 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                                                <p className="font-medium text-foreground">
                                                    {immunization.vaccine}
                                                </p>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    Given:{" "}
                                                    {formatDate(
                                                        immunization.date
                                                    )}
                                                </p>
                                                {immunization.nextDueDate && (
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Next due:{" "}
                                                        {formatDate(
                                                            immunization.nextDueDate
                                                        )}
                                                    </p>
                                                )}
                                            </div>
                                        )
                                    )}
                                </div>
                            ) : (
                                <p className="text-center py-6 text-muted-foreground">
                                    No immunizations recorded
                                </p>
                            )}
                        </Card>

                        {/* Family History */}
                        {medicalHistory.familyHistory?.length > 0 && (
                            <Card className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold flex items-center">
                                        <Users className="h-5 w-5 mr-2 text-indigo-500" />
                                        Family History
                                    </h3>
                                    <Badge variant="secondary">
                                        {medicalHistory.familyHistory.length}
                                    </Badge>
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {medicalHistory.familyHistory.map(
                                        (history, idx) => (
                                            <div
                                                key={idx}
                                                className="p-4 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 rounded-lg">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <p className="font-medium text-foreground">
                                                            {history.condition}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground mt-1">
                                                            {history.relation}
                                                        </p>
                                                    </div>
                                                    {history.ageOfOnset && (
                                                        <Badge
                                                            variant="outline"
                                                            className="ml-2">
                                                            Age{" "}
                                                            {history.ageOfOnset}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            </Card>
                        )}
                    </div>
                </TabsContent>

                {/* Lifestyle */}
                <TabsContent value="lifestyle">
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold mb-4">
                            Social History & Lifestyle
                        </h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                                    <Cigarette className="h-5 w-5 mt-0.5 text-muted-foreground" />
                                    <div className="flex-1">
                                        <p className="text-sm text-muted-foreground">
                                            Smoking Status
                                        </p>
                                        <p className="font-medium capitalize">
                                            {medicalHistory.socialHistory
                                                ?.smokingStatus ||
                                                "Not specified"}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                                    <Wine className="h-5 w-5 mt-0.5 text-muted-foreground" />
                                    <div className="flex-1">
                                        <p className="text-sm text-muted-foreground">
                                            Alcohol Consumption
                                        </p>
                                        <p className="font-medium capitalize">
                                            {medicalHistory.socialHistory
                                                ?.alcoholConsumption ||
                                                "Not specified"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                                    <Activity className="h-5 w-5 mt-0.5 text-muted-foreground" />
                                    <div className="flex-1">
                                        <p className="text-sm text-muted-foreground">
                                            Exercise Frequency
                                        </p>
                                        <p className="font-medium">
                                            {medicalHistory.socialHistory
                                                ?.exerciseFrequency ||
                                                "Not specified"}
                                        </p>
                                    </div>
                                </div>
                                {medicalHistory.socialHistory?.occupation && (
                                    <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                                        <Briefcase className="h-5 w-5 mt-0.5 text-muted-foreground" />
                                        <div className="flex-1">
                                            <p className="text-sm text-muted-foreground">
                                                Occupation
                                            </p>
                                            <p className="font-medium">
                                                {
                                                    medicalHistory.socialHistory
                                                        .occupation
                                                }
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default ProviderPatientMedicalHistoryViewer;