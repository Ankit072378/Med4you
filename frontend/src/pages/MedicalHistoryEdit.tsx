import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useMedicalRecordActions } from "@/hooks/useMedicalRecordActions";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    AlertCircle,
    Pill,
    Syringe,
    HeartPulse,
    Users,
    Shield,
    Plus,
    Trash2,
    Save,
    Loader2,
    ArrowLeft,
    Droplet,
    Briefcase,
    Activity,
} from "lucide-react";
import { toast } from "sonner";

const MedicalHistoryEdit = () => {
    const { user, profile } = useAuth();
    const navigate = useNavigate();
    const {
        handleGetMyMedicalHistory,
        handleCreateOrUpdateMyMedicalHistory,
        loading,
    } = useMedicalRecordActions();

    const [medicalHistory, setMedicalHistory] = useState(null);
    const [formData, setFormData] = useState({
        chronicConditions: [],
        allergies: [],
        currentMedications: [],
        surgeries: [],
        immunizations: [],
        familyHistory: [],
        socialHistory: {
            smokingStatus: "never",
            alcoholConsumption: "none",
            occupation: "",
            exerciseFrequency: "",
        },
        bloodType: "",
        privacySettings: {
            allowDataSharing: false,
            allowResearchUse: false,
        },
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        // Check if user is patient
        if (user?.role !== "patient") {
            navigate("/");
            return;
        }

        fetchMedicalHistory();
    }, [user, navigate]);

    const fetchMedicalHistory = async () => {
        const result = await handleGetMyMedicalHistory();
        if (result.success && result.data) {
            setMedicalHistory(result.data);
            setFormData({
                chronicConditions: result.data.chronicConditions || [],
                allergies: result.data.allergies || [],
                currentMedications: result.data.currentMedications || [],
                surgeries: result.data.surgeries || [],
                immunizations: result.data.immunizations || [],
                familyHistory: result.data.familyHistory || [],
                socialHistory: result.data.socialHistory || {
                    smokingStatus: "never",
                    alcoholConsumption: "none",
                    occupation: "",
                    exerciseFrequency: "",
                },
                bloodType: result.data.bloodType || "",
                privacySettings: result.data.privacySettings || {
                    allowDataSharing: false,
                    allowResearchUse: false,
                },
            });
        }
    };

    // Add Chronic Condition
    const addChronicCondition = () => {
        setFormData({
            ...formData,
            chronicConditions: [
                ...formData.chronicConditions,
                {
                    condition: "",
                    diagnosedDate: "",
                    managementPlan: "",
                    status: "active",
                },
            ],
        });
    };

    const updateChronicCondition = (index, field, value) => {
        const updated = [...formData.chronicConditions];
        updated[index][field] = value;
        setFormData({ ...formData, chronicConditions: updated });
    };

    const removeChronicCondition = (index) => {
        const updated = formData.chronicConditions.filter((_, i) => i !== index);
        setFormData({ ...formData, chronicConditions: updated });
    };

    // Add Allergy
    const addAllergy = () => {
        setFormData({
            ...formData,
            allergies: [
                ...formData.allergies,
                {
                    allergen: "",
                    type: "drug",
                    severity: "mild",
                    reaction: "",
                    diagnosedDate: "",
                },
            ],
        });
    };

    const updateAllergy = (index, field, value) => {
        const updated = [...formData.allergies];
        updated[index][field] = value;
        setFormData({ ...formData, allergies: updated });
    };

    const removeAllergy = (index) => {
        const updated = formData.allergies.filter((_, i) => i !== index);
        setFormData({ ...formData, allergies: updated });
    };

    // Add Medication
    const addMedication = () => {
        setFormData({
            ...formData,
            currentMedications: [
                ...formData.currentMedications,
                {
                    medication: "",
                    dosage: "",
                    frequency: "",
                    startDate: "",
                    prescribedBy: "",
                    reason: "",
                },
            ],
        });
    };

    const updateMedication = (index, field, value) => {
        const updated = [...formData.currentMedications];
        updated[index][field] = value;
        setFormData({ ...formData, currentMedications: updated });
    };

    const removeMedication = (index) => {
        const updated = formData.currentMedications.filter((_, i) => i !== index);
        setFormData({ ...formData, currentMedications: updated });
    };

    // Add Surgery
    const addSurgery = () => {
        setFormData({
            ...formData,
            surgeries: [
                ...formData.surgeries,
                {
                    procedure: "",
                    date: "",
                    hospital: "",
                    surgeon: "",
                    notes: "",
                },
            ],
        });
    };

    const updateSurgery = (index, field, value) => {
        const updated = [...formData.surgeries];
        updated[index][field] = value;
        setFormData({ ...formData, surgeries: updated });
    };

    const removeSurgery = (index) => {
        const updated = formData.surgeries.filter((_, i) => i !== index);
        setFormData({ ...formData, surgeries: updated });
    };

    // Add Immunization
    const addImmunization = () => {
        setFormData({
            ...formData,
            immunizations: [
                ...formData.immunizations,
                {
                    vaccine: "",
                    date: "",
                    nextDueDate: "",
                    batchNumber: "",
                    administeredBy: "",
                },
            ],
        });
    };

    const updateImmunization = (index, field, value) => {
        const updated = [...formData.immunizations];
        updated[index][field] = value;
        setFormData({ ...formData, immunizations: updated });
    };

    const removeImmunization = (index) => {
        const updated = formData.immunizations.filter((_, i) => i !== index);
        setFormData({ ...formData, immunizations: updated });
    };

    // Add Family History
    const addFamilyHistory = () => {
        setFormData({
            ...formData,
            familyHistory: [
                ...formData.familyHistory,
                {
                    relation: "",
                    condition: "",
                    ageOfOnset: "",
                },
            ],
        });
    };

    const updateFamilyHistory = (index, field, value) => {
        const updated = [...formData.familyHistory];
        updated[index][field] = value;
        setFormData({ ...formData, familyHistory: updated });
    };

    const removeFamilyHistory = (index) => {
        const updated = formData.familyHistory.filter((_, i) => i !== index);
        setFormData({ ...formData, familyHistory: updated });
    };

    // Update Social History
    const updateSocialHistory = (field, value) => {
        setFormData({
            ...formData,
            socialHistory: {
                ...formData.socialHistory,
                [field]: value,
            },
        });
    };

    // Update Privacy Settings
    const updatePrivacySettings = (field, value) => {
        setFormData({
            ...formData,
            privacySettings: {
                ...formData.privacySettings,
                [field]: value,
            },
        });
    };

    // Save Medical History
    const handleSave = async () => {
        setIsSaving(true);

        // Validate required fields
        if (!formData.bloodType) {
            toast.error("Please select your blood type");
            setIsSaving(false);
            return;
        }

        const result = await handleCreateOrUpdateMyMedicalHistory(formData);

        if (result.success) {
            toast.success(
                medicalHistory
                    ? "Medical history updated successfully!"
                    : "Medical history created successfully!"
            );
            navigate("/profile");
        } else {
            toast.error(result.error || "Failed to save medical history");
        }

        setIsSaving(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="container py-20 flex items-center justify-center">
                    <div className="text-center">
                        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                        <p className="text-muted-foreground">Loading...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <div className="container py-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <Button
                            variant="ghost"
                            onClick={() => navigate("/patient-profile")}
                            className="mb-4 -ml-3">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Profile
                        </Button>
                        <h1 className="text-3xl font-bold text-foreground mb-2">
                            {medicalHistory
                                ? "Edit Medical History"
                                : "Create Medical History"}
                        </h1>
                        <p className="text-muted-foreground">
                            Complete your medical history to help doctors provide
                            better care
                        </p>
                    </div>

                    {/* Basic Information */}
                    <Card className="p-6 mb-6">
                        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
                            <Droplet className="h-5 w-5 mr-2 text-red-500" />
                            Basic Information
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="bloodType">
                                    Blood Type <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={formData.bloodType}
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, bloodType: value })
                                    }>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select blood type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="A+">A+</SelectItem>
                                        <SelectItem value="A-">A-</SelectItem>
                                        <SelectItem value="B+">B+</SelectItem>
                                        <SelectItem value="B-">B-</SelectItem>
                                        <SelectItem value="AB+">AB+</SelectItem>
                                        <SelectItem value="AB-">AB-</SelectItem>
                                        <SelectItem value="O+">O+</SelectItem>
                                        <SelectItem value="O-">O-</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </Card>

                    {/* Accordion Sections */}
                    <Accordion type="multiple" className="space-y-4">
                        {/* Chronic Conditions */}
                        <AccordionItem value="chronic-conditions">
                            <Card>
                                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                                    <div className="flex items-center justify-between w-full pr-4">
                                        <div className="flex items-center">
                                            <HeartPulse className="h-5 w-5 mr-2 text-orange-500" />
                                            <span className="font-semibold">
                                                Chronic Conditions
                                            </span>
                                        </div>
                                        {formData.chronicConditions.length > 0 && (
                                            <Badge variant="secondary">
                                                {formData.chronicConditions.length}
                                            </Badge>
                                        )}
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-6 pb-4">
                                    <div className="space-y-4">
                                        {formData.chronicConditions.map((condition, idx) => (
                                            <Card key={idx} className="p-4 bg-muted/30">
                                                <div className="flex justify-between items-start mb-4">
                                                    <h4 className="font-medium text-foreground">
                                                        Condition #{idx + 1}
                                                    </h4>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            removeChronicCondition(idx)
                                                        }>
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </div>
                                                <div className="grid md:grid-cols-2 gap-4">
                                                    <div>
                                                        <Label>Condition Name</Label>
                                                        <Input
                                                            value={condition.condition}
                                                            onChange={(e) =>
                                                                updateChronicCondition(
                                                                    idx,
                                                                    "condition",
                                                                    e.target.value
                                                                )
                                                            }
                                                            placeholder="e.g., Asthma"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label>Diagnosed Date</Label>
                                                        <Input
                                                            type="date"
                                                            value={
                                                                condition.diagnosedDate
                                                                    ? new Date(
                                                                          condition.diagnosedDate
                                                                      )
                                                                          .toISOString()
                                                                          .split("T")[0]
                                                                    : ""
                                                            }
                                                            onChange={(e) =>
                                                                updateChronicCondition(
                                                                    idx,
                                                                    "diagnosedDate",
                                                                    e.target.value
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label>Status</Label>
                                                        <Select
                                                            value={condition.status}
                                                            onValueChange={(value) =>
                                                                updateChronicCondition(
                                                                    idx,
                                                                    "status",
                                                                    value
                                                                )
                                                            }>
                                                            <SelectTrigger>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="active">
                                                                    Active
                                                                </SelectItem>
                                                                <SelectItem value="managed">
                                                                    Managed
                                                                </SelectItem>
                                                                <SelectItem value="resolved">
                                                                    Resolved
                                                                </SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <Label>Management Plan</Label>
                                                        <Textarea
                                                            value={condition.managementPlan}
                                                            onChange={(e) =>
                                                                updateChronicCondition(
                                                                    idx,
                                                                    "managementPlan",
                                                                    e.target.value
                                                                )
                                                            }
                                                            placeholder="How is this condition being managed?"
                                                            rows={2}
                                                        />
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}
                                        <Button
                                            variant="outline"
                                            onClick={addChronicCondition}
                                            className="w-full">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Chronic Condition
                                        </Button>
                                    </div>
                                </AccordionContent>
                            </Card>
                        </AccordionItem>

                        {/* Allergies */}
                        <AccordionItem value="allergies">
                            <Card>
                                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                                    <div className="flex items-center justify-between w-full pr-4">
                                        <div className="flex items-center">
                                            <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
                                            <span className="font-semibold">Allergies</span>
                                        </div>
                                        {formData.allergies.length > 0 && (
                                            <Badge variant="destructive">
                                                {formData.allergies.length}
                                            </Badge>
                                        )}
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-6 pb-4">
                                    <div className="space-y-4">
                                        {formData.allergies.map((allergy, idx) => (
                                            <Card key={idx} className="p-4 bg-muted/30">
                                                <div className="flex justify-between items-start mb-4">
                                                    <h4 className="font-medium text-foreground">
                                                        Allergy #{idx + 1}
                                                    </h4>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeAllergy(idx)}>
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </div>
                                                <div className="grid md:grid-cols-2 gap-4">
                                                    <div>
                                                        <Label>Allergen</Label>
                                                        <Input
                                                            value={allergy.allergen}
                                                            onChange={(e) =>
                                                                updateAllergy(
                                                                    idx,
                                                                    "allergen",
                                                                    e.target.value
                                                                )
                                                            }
                                                            placeholder="e.g., Penicillin"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label>Type</Label>
                                                        <Select
                                                            value={allergy.type}
                                                            onValueChange={(value) =>
                                                                updateAllergy(
                                                                    idx,
                                                                    "type",
                                                                    value
                                                                )
                                                            }>
                                                            <SelectTrigger>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="drug">
                                                                    Drug
                                                                </SelectItem>
                                                                <SelectItem value="food">
                                                                    Food
                                                                </SelectItem>
                                                                <SelectItem value="environmental">
                                                                    Environmental
                                                                </SelectItem>
                                                                <SelectItem value="other">
                                                                    Other
                                                                </SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div>
                                                        <Label>Severity</Label>
                                                        <Select
                                                            value={allergy.severity}
                                                            onValueChange={(value) =>
                                                                updateAllergy(
                                                                    idx,
                                                                    "severity",
                                                                    value
                                                                )
                                                            }>
                                                            <SelectTrigger>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="mild">
                                                                    Mild
                                                                </SelectItem>
                                                                <SelectItem value="moderate">
                                                                    Moderate
                                                                </SelectItem>
                                                                <SelectItem value="severe">
                                                                    Severe
                                                                </SelectItem>
                                                                <SelectItem value="life_threatening">
                                                                    Life Threatening
                                                                </SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div>
                                                        <Label>Diagnosed Date</Label>
                                                        <Input
                                                            type="date"
                                                            value={
                                                                allergy.diagnosedDate
                                                                    ? new Date(
                                                                          allergy.diagnosedDate
                                                                      )
                                                                          .toISOString()
                                                                          .split("T")[0]
                                                                    : ""
                                                            }
                                                            onChange={(e) =>
                                                                updateAllergy(
                                                                    idx,
                                                                    "diagnosedDate",
                                                                    e.target.value
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <Label>Reaction</Label>
                                                        <Textarea
                                                            value={allergy.reaction}
                                                            onChange={(e) =>
                                                                updateAllergy(
                                                                    idx,
                                                                    "reaction",
                                                                    e.target.value
                                                                )
                                                            }
                                                            placeholder="Describe the allergic reaction"
                                                            rows={2}
                                                        />
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}
                                        <Button
                                            variant="outline"
                                            onClick={addAllergy}
                                            className="w-full">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Allergy
                                        </Button>
                                    </div>
                                </AccordionContent>
                            </Card>
                        </AccordionItem>

                        {/* Current Medications */}
                        <AccordionItem value="medications">
                            <Card>
                                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                                    <div className="flex items-center justify-between w-full pr-4">
                                        <div className="flex items-center">
                                            <Pill className="h-5 w-5 mr-2 text-green-500" />
                                            <span className="font-semibold">
                                                Current Medications
                                            </span>
                                        </div>
                                        {formData.currentMedications.length > 0 && (
                                            <Badge variant="secondary">
                                                {formData.currentMedications.length}
                                            </Badge>
                                        )}
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-6 pb-4">
                                    <div className="space-y-4">
                                        {formData.currentMedications.map(
                                            (medication, idx) => (
                                                <Card key={idx} className="p-4 bg-muted/30">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <h4 className="font-medium text-foreground">
                                                            Medication #{idx + 1}
                                                        </h4>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                removeMedication(idx)
                                                            }>
                                                            <Trash2 className="h-4 w-4 text-red-500" />
                                                        </Button>
                                                    </div>
                                                    <div className="grid md:grid-cols-2 gap-4">
                                                        <div>
                                                            <Label>Medication Name</Label>
                                                            <Input
                                                                value={medication.medication}
                                                                onChange={(e) =>
                                                                    updateMedication(
                                                                        idx,
                                                                        "medication",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                placeholder="e.g., Aspirin"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label>Dosage</Label>
                                                            <Input
                                                                value={medication.dosage}
                                                                onChange={(e) =>
                                                                    updateMedication(
                                                                        idx,
                                                                        "dosage",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                placeholder="e.g., 75 mg"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label>Frequency</Label>
                                                            <Input
                                                                value={medication.frequency}
                                                                onChange={(e) =>
                                                                    updateMedication(
                                                                        idx,
                                                                        "frequency",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                placeholder="e.g., Once daily"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label>Start Date</Label>
                                                            <Input
                                                                type="date"
                                                                value={
                                                                    medication.startDate
                                                                        ? new Date(
                                                                              medication.startDate
                                                                          )
                                                                              .toISOString()
                                                                              .split("T")[0]
                                                                        : ""
                                                                }
                                                                onChange={(e) =>
                                                                    updateMedication(
                                                                        idx,
                                                                        "startDate",
                                                                        e.target.value
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label>Prescribed By</Label>
                                                            <Input
                                                                value={medication.prescribedBy}
                                                                onChange={(e) =>
                                                                    updateMedication(
                                                                        idx,
                                                                        "prescribedBy",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                placeholder="Doctor's name"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label>Reason</Label>
                                                            <Input
                                                                value={medication.reason}
                                                                onChange={(e) =>
                                                                    updateMedication(
                                                                        idx,
                                                                        "reason",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                placeholder="Purpose of medication"
                                                            />
                                                        </div>
                                                    </div>
                                                </Card>
                                            )
                                        )}
                                        <Button
                                            variant="outline"
                                            onClick={addMedication}
                                            className="w-full">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Medication
                                        </Button>
                                    </div>
                                </AccordionContent>
                            </Card>
                        </AccordionItem>

                        {/* Past Surgeries */}
                        <AccordionItem value="surgeries">
                            <Card>
                                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                                    <div className="flex items-center justify-between w-full pr-4">
                                        <div className="flex items-center">
                                            <Activity className="h-5 w-5 mr-2 text-blue-500" />
                                            <span className="font-semibold">
                                                Past Surgeries
                                            </span>
                                        </div>
                                        {formData.surgeries.length > 0 && (
                                            <Badge variant="secondary">
                                                {formData.surgeries.length}
                                            </Badge>
                                        )}
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-6 pb-4">
                                    <div className="space-y-4">
                                        {formData.surgeries.map((surgery, idx) => (
                                            <Card key={idx} className="p-4 bg-muted/30">
                                                <div className="flex justify-between items-start mb-4">
                                                    <h4 className="font-medium text-foreground">
                                                        Surgery #{idx + 1}
                                                    </h4>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeSurgery(idx)}>
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </div>
                                                <div className="grid md:grid-cols-2 gap-4">
                                                    <div>
                                                        <Label>Procedure</Label>
                                                        <Input
                                                            value={surgery.procedure}
                                                            onChange={(e) =>
                                                                updateSurgery(
                                                                    idx,
                                                                    "procedure",
                                                                    e.target.value
                                                                )
                                                            }
                                                            placeholder="e.g., Appendectomy"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label>Date</Label>
                                                        <Input
                                                            type="date"
                                                            value={
                                                                surgery.date
                                                                    ? new Date(surgery.date)
                                                                          .toISOString()
                                                                          .split("T")[0]
                                                                    : ""
                                                            }
                                                            onChange={(e) =>
                                                                updateSurgery(
                                                                    idx,
                                                                    "date",
                                                                    e.target.value
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label>Hospital</Label>
                                                        <Input
                                                            value={surgery.hospital}
                                                            onChange={(e) =>
                                                                updateSurgery(
                                                                    idx,
                                                                    "hospital",
                                                                    e.target.value
                                                                )
                                                            }
                                                            placeholder="Hospital name"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label>Surgeon</Label>
                                                        <Input
                                                            value={surgery.surgeon}
                                                            onChange={(e) =>
                                                                updateSurgery(
                                                                    idx,
                                                                    "surgeon",
                                                                    e.target.value
                                                                )
                                                            }
                                                            placeholder="Surgeon's name"
                                                        />
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <Label>Notes</Label>
                                                        <Textarea
                                                            value={surgery.notes}
                                                            onChange={(e) =>
                                                                updateSurgery(
                                                                    idx,
                                                                    "notes",
                                                                    e.target.value
                                                                )
                                                            }
                                                            placeholder="Additional information"
                                                            rows={2}
                                                        />
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}
                                        <Button
                                            variant="outline"
                                            onClick={addSurgery}
                                            className="w-full">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Surgery
                                        </Button>
                                    </div>
                                </AccordionContent>
                            </Card>
                        </AccordionItem>

                        {/* Immunizations */}
                        <AccordionItem value="immunizations">
                            <Card>
                                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                                    <div className="flex items-center justify-between w-full pr-4">
                                        <div className="flex items-center">
                                            <Syringe className="h-5 w-5 mr-2 text-purple-500" />
                                            <span className="font-semibold">
                                                Immunizations
                                            </span>
                                        </div>
                                        {formData.immunizations.length > 0 && (
                                            <Badge variant="secondary">
                                                {formData.immunizations.length}
                                            </Badge>
                                        )}
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-6 pb-4">
                                    <div className="space-y-4">
                                        {formData.immunizations.map(
                                            (immunization, idx) => (
                                                <Card key={idx} className="p-4 bg-muted/30">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <h4 className="font-medium text-foreground">
                                                            Immunization #{idx + 1}
                                                        </h4>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                removeImmunization(idx)
                                                            }>
                                                            <Trash2 className="h-4 w-4 text-red-500" />
                                                        </Button>
                                                    </div>
                                                    <div className="grid md:grid-cols-2 gap-4">
                                                        <div>
                                                            <Label>Vaccine</Label>
                                                            <Input
                                                                value={immunization.vaccine}
                                                                onChange={(e) =>
                                                                    updateImmunization(
                                                                        idx,
                                                                        "vaccine",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                placeholder="e.g., COVID-19"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label>Date Given</Label>
                                                            <Input
                                                                type="date"
                                                                value={
                                                                    immunization.date
                                                                        ? new Date(
                                                                              immunization.date
                                                                          )
                                                                              .toISOString()
                                                                              .split("T")[0]
                                                                        : ""
                                                                }
                                                                onChange={(e) =>
                                                                    updateImmunization(
                                                                        idx,
                                                                        "date",
                                                                        e.target.value
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label>Next Due Date</Label>
                                                            <Input
                                                                type="date"
                                                                value={
                                                                    immunization.nextDueDate
                                                                        ? new Date(
                                                                              immunization.nextDueDate
                                                                          )
                                                                              .toISOString()
                                                                              .split("T")[0]
                                                                        : ""
                                                                }
                                                                onChange={(e) =>
                                                                    updateImmunization(
                                                                        idx,
                                                                        "nextDueDate",
                                                                        e.target.value
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label>Batch Number</Label>
                                                            <Input
                                                                value={immunization.batchNumber}
                                                                onChange={(e) =>
                                                                    updateImmunization(
                                                                        idx,
                                                                        "batchNumber",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                placeholder="Optional"
                                                            />
                                                        </div>
                                                        <div className="md:col-span-2">
                                                            <Label>Administered By</Label>
                                                            <Input
                                                                value={
                                                                    immunization.administeredBy
                                                                }
                                                                onChange={(e) =>
                                                                    updateImmunization(
                                                                        idx,
                                                                        "administeredBy",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                placeholder="Hospital or clinic name"
                                                            />
                                                        </div>
                                                    </div>
                                                </Card>
                                            )
                                        )}
                                        <Button
                                            variant="outline"
                                            onClick={addImmunization}
                                            className="w-full">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Immunization
                                        </Button>
                                    </div>
                                </AccordionContent>
                            </Card>
                        </AccordionItem>

                        {/* Family History */}
                        <AccordionItem value="family-history">
                            <Card>
                                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                                    <div className="flex items-center justify-between w-full pr-4">
                                        <div className="flex items-center">
                                            <Users className="h-5 w-5 mr-2 text-indigo-500" />
                                            <span className="font-semibold">
                                                Family History
                                            </span>
                                        </div>
                                        {formData.familyHistory.length > 0 && (
                                            <Badge variant="secondary">
                                                {formData.familyHistory.length}
                                            </Badge>
                                        )}
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-6 pb-4">
                                    <div className="space-y-4">
                                        {formData.familyHistory.map((history, idx) => (
                                            <Card key={idx} className="p-4 bg-muted/30">
                                                <div className="flex justify-between items-start mb-4">
                                                    <h4 className="font-medium text-foreground">
                                                        Family Member #{idx + 1}
                                                    </h4>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            removeFamilyHistory(idx)
                                                        }>
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </div>
                                                <div className="grid md:grid-cols-3 gap-4">
                                                    <div>
                                                        <Label>Relation</Label>
                                                        <Input
                                                            value={history.relation}
                                                            onChange={(e) =>
                                                                updateFamilyHistory(
                                                                    idx,
                                                                    "relation",
                                                                    e.target.value
                                                                )
                                                            }
                                                            placeholder="e.g., Father"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label>Condition</Label>
                                                        <Input
                                                            value={history.condition}
                                                            onChange={(e) =>
                                                                updateFamilyHistory(
                                                                    idx,
                                                                    "condition",
                                                                    e.target.value
                                                                )
                                                            }
                                                            placeholder="e.g., Diabetes"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label>Age of Onset</Label>
                                                        <Input
                                                            type="number"
                                                            value={history.ageOfOnset}
                                                            onChange={(e) =>
                                                                updateFamilyHistory(
                                                                    idx,
                                                                    "ageOfOnset",
                                                                    e.target.value
                                                                )
                                                            }
                                                            placeholder="Age"
                                                        />
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}
                                        <Button
                                            variant="outline"
                                            onClick={addFamilyHistory}
                                            className="w-full">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Family History
                                        </Button>
                                    </div>
                                </AccordionContent>
                            </Card>
                        </AccordionItem>

                        {/* Social History */}
                        <AccordionItem value="social-history">
                            <Card>
                                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                                    <div className="flex items-center">
                                        <Briefcase className="h-5 w-5 mr-2 text-teal-500" />
                                        <span className="font-semibold">
                                            Social History
                                        </span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-6 pb-4">
                                    <div className="space-y-4">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <Label>Smoking Status</Label>
                                                <Select
                                                    value={
                                                        formData.socialHistory
                                                            .smokingStatus
                                                    }
                                                    onValueChange={(value) =>
                                                        updateSocialHistory(
                                                            "smokingStatus",
                                                            value
                                                        )
                                                    }>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="never">
                                                            Never
                                                        </SelectItem>
                                                        <SelectItem value="former">
                                                            Former
                                                        </SelectItem>
                                                        <SelectItem value="current">
                                                            Current
                                                        </SelectItem>
                                                        <SelectItem value="unknown">
                                                            Unknown
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label>Alcohol Consumption</Label>
                                                <Select
                                                    value={
                                                        formData.socialHistory
                                                            .alcoholConsumption
                                                    }
                                                    onValueChange={(value) =>
                                                        updateSocialHistory(
                                                            "alcoholConsumption",
                                                            value
                                                        )
                                                    }>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="none">
                                                            None
                                                        </SelectItem>
                                                        <SelectItem value="occasional">
                                                            Occasional
                                                        </SelectItem>
                                                        <SelectItem value="moderate">
                                                            Moderate
                                                        </SelectItem>
                                                        <SelectItem value="heavy">
                                                            Heavy
                                                        </SelectItem>
                                                        <SelectItem value="unknown">
                                                            Unknown
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label>Occupation</Label>
                                                <Input
                                                    value={
                                                        formData.socialHistory.occupation
                                                    }
                                                    onChange={(e) =>
                                                        updateSocialHistory(
                                                            "occupation",
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="Your occupation"
                                                />
                                            </div>
                                            <div>
                                                <Label>Exercise Frequency</Label>
                                                <Input
                                                    value={
                                                        formData.socialHistory
                                                            .exerciseFrequency
                                                    }
                                                    onChange={(e) =>
                                                        updateSocialHistory(
                                                            "exerciseFrequency",
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="e.g., 3 times per week"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </AccordionContent>
                            </Card>
                        </AccordionItem>

                        {/* Privacy Settings */}
                        <AccordionItem value="privacy">
                            <Card>
                                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                                    <div className="flex items-center">
                                        <Shield className="h-5 w-5 mr-2 text-gray-500" />
                                        <span className="font-semibold">
                                            Privacy Settings
                                        </span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-6 pb-4">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                                            <div className="flex-1">
                                                <Label className="text-base">
                                                    Allow Data Sharing
                                                </Label>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    Allow anonymized data sharing for
                                                    research purposes
                                                </p>
                                            </div>
                                            <Switch
                                                checked={
                                                    formData.privacySettings
                                                        .allowDataSharing
                                                }
                                                onCheckedChange={(value) =>
                                                    updatePrivacySettings(
                                                        "allowDataSharing",
                                                        value
                                                    )
                                                }
                                            />
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                                            <div className="flex-1">
                                                <Label className="text-base">
                                                    Allow Research Use
                                                </Label>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    Allow your medical data to be used
                                                    for medical research
                                                </p>
                                            </div>
                                            <Switch
                                                checked={
                                                    formData.privacySettings
                                                        .allowResearchUse
                                                }
                                                onCheckedChange={(value) =>
                                                    updatePrivacySettings(
                                                        "allowResearchUse",
                                                        value
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                </AccordionContent>
                            </Card>
                        </AccordionItem>
                    </Accordion>

                    {/* Save Button */}
                    <div className="mt-8 flex gap-4">
                        <Button
                            variant="outline"
                            onClick={() => navigate("/profile")}
                            className="flex-1">
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex-1">
                            {isSaving ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Medical History
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MedicalHistoryEdit;