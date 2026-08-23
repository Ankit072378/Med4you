import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { X, Plus, Loader2, Stethoscope, Building2 } from "lucide-react";
import { toast } from "sonner";

const MedicalRecordForm = ({
    appointmentId,
    patientId,
    onSuccess,
    onCancel,
}) => {
    const { user, profile } = useAuth();
    const [saving, setSaving] = useState(false);

    // Role-specific selections
    const [selectedHospitalId, setSelectedHospitalId] = useState(null);
    const [selectedDoctorId, setSelectedDoctorId] = useState(null);

    const [formData, setFormData] = useState({
        visitType: "consultation",
        chiefComplaint: "",
        symptoms: [],
        diagnosis: [],
        vitalSigns: {
            bloodPressure: "",
            heartRate: "",
            temperature: "",
            weight: "",
            height: "",
            spo2: "",
        },
        physicalExamination: "",
        clinicalNotes: "",
        prescriptions: [],
        labTests: [],
        followUp: {
            required: false,
            date: "",
            instructions: "",
        },
    });

    const [symptomInput, setSymptomInput] = useState("");
    const [diagnosisInput, setDiagnosisInput] = useState({
        condition: "",
        severity: "mild",
        notes: "",
    });
    const [prescriptionInput, setPrescriptionInput] = useState({
        medication: "",
        dosage: "",
        frequency: "",
        duration: "",
        instructions: "",
    });

    // Auto-select if only one option available
    useEffect(() => {
        if (user?.role === "doctor" && profile?.hospitals?.length === 1) {
            setSelectedHospitalId(profile.hospitals[0]._id);
        }
        if (user?.role === "hospital" && profile?.doctorIds?.length === 1) {
            setSelectedDoctorId(profile.doctorIds[0]._id);
        }
    }, [profile, user]);

    const handleAddSymptom = () => {
        if (symptomInput.trim()) {
            setFormData({
                ...formData,
                symptoms: [...formData.symptoms, symptomInput.trim()],
            });
            setSymptomInput("");
        }
    };

    const handleRemoveSymptom = (index) => {
        setFormData({
            ...formData,
            symptoms: formData.symptoms.filter((_, i) => i !== index),
        });
    };

    const handleAddDiagnosis = () => {
        if (diagnosisInput.condition.trim()) {
            setFormData({
                ...formData,
                diagnosis: [
                    ...formData.diagnosis,
                    {
                        ...diagnosisInput,
                        diagnosedDate: new Date(),
                        status: "active",
                    },
                ],
            });
            setDiagnosisInput({ condition: "", severity: "mild", notes: "" });
        }
    };

    const handleRemoveDiagnosis = (index) => {
        setFormData({
            ...formData,
            diagnosis: formData.diagnosis.filter((_, i) => i !== index),
        });
    };

    const handleAddPrescription = () => {
        if (
            prescriptionInput.medication.trim() &&
            prescriptionInput.dosage.trim() &&
            prescriptionInput.frequency.trim() &&
            prescriptionInput.duration.trim()
        ) {
            setFormData({
                ...formData,
                prescriptions: [...formData.prescriptions, prescriptionInput],
            });
            setPrescriptionInput({
                medication: "",
                dosage: "",
                frequency: "",
                duration: "",
                instructions: "",
            });
        } else {
            toast.error("Please fill all required prescription fields");
        }
    };

    const handleRemovePrescription = (index) => {
        setFormData({
            ...formData,
            prescriptions: formData.prescriptions.filter((_, i) => i !== index),
        });
    };

    const handleSubmit = async () => {
        // Validation
        if (!formData.chiefComplaint.trim()) {
            toast.error("Chief complaint is required");
            return;
        }

        if (formData.diagnosis.length === 0) {
            toast.error("At least one diagnosis is required");
            return;
        }

        // Role-specific validation
        if (user.role === "hospital" && !selectedDoctorId) {
            toast.error("Please select a doctor");
            return;
        }

        setSaving(true);

        // Build record data dynamically
        const recordData = {
            patientId,
            appointmentId,
            visitType: formData.visitType,
            chiefComplaint: formData.chiefComplaint,
            symptoms: formData.symptoms,
            diagnosis: formData.diagnosis,
            vitalSigns: formData.vitalSigns,
            physicalExamination: formData.physicalExamination,
            clinicalNotes: formData.clinicalNotes,
            prescriptions: formData.prescriptions,
            labTests: formData.labTests,
            followUp: formData.followUp,
            // ✅ Conditionally add properties inline
            ...(user.role === "doctor" &&
                selectedHospitalId && { hospitalId: selectedHospitalId }),
            ...(user.role === "hospital" &&
                selectedDoctorId && { doctorId: selectedDoctorId }),
        };

        try {
            await onSuccess(recordData);
        } catch (error) {
            toast.error("Failed to save medical record");
        } finally {
            setSaving(false);
        }
    };


    return (
        <Card className="p-6">
            <h3 className="text-xl font-semibold mb-6">
                Complete Medical Record
            </h3>

            <div className="space-y-6">
                {/* Role-Specific Selections */}
                {user?.role === "doctor" && profile?.hospitals?.length > 1 && (
                    <div>
                        <Label
                            htmlFor="hospital"
                            className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            Select Hospital
                        </Label>
                        <Select
                            value={selectedHospitalId || ""}
                            onValueChange={setSelectedHospitalId}>
                            <SelectTrigger id="hospital" className="mt-1">
                                <SelectValue placeholder="Select hospital for this consultation" />
                            </SelectTrigger>
                            <SelectContent>
                                {profile.hospitals.map((hospital) => (
                                    <SelectItem
                                        key={hospital._id}
                                        value={hospital._id}>
                                        {hospital.name} - {hospital.city}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground mt-1">
                            Optional: Select if this consultation is at a
                            specific hospital
                        </p>
                    </div>
                )}

                {user?.role === "hospital" && (
                    <div>
                        <Label
                            htmlFor="doctor"
                            className="flex items-center gap-2">
                            <Stethoscope className="h-4 w-4" />
                            Select Doctor *
                        </Label>
                        <Select
                            value={selectedDoctorId || ""}
                            onValueChange={setSelectedDoctorId}
                            required>
                            <SelectTrigger id="doctor" className="mt-1">
                                <SelectValue placeholder="Select doctor who treated this patient" />
                            </SelectTrigger>
                            <SelectContent>
                                {profile?.doctorIds?.map((doctor) => (
                                    <SelectItem
                                        key={doctor._id}
                                        value={doctor._id}>
                                        Dr. {doctor.name} - {doctor.type}
                                        {doctor.specializations?.length > 0 &&
                                            ` (${doctor.specializations[0]})`}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {!selectedDoctorId && (
                            <p className="text-xs text-destructive mt-1">
                                Required: Select the doctor who provided
                                treatment
                            </p>
                        )}
                    </div>
                )}

                {/* Visit Type */}
                <div>
                    <Label htmlFor="visitType">Visit Type *</Label>
                    <Select
                        value={formData.visitType}
                        onValueChange={(value) =>
                            setFormData({ ...formData, visitType: value })
                        }>
                        <SelectTrigger id="visitType" className="mt-1">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="consultation">
                                Consultation
                            </SelectItem>
                            <SelectItem value="follow_up">Follow-up</SelectItem>
                            <SelectItem value="emergency">Emergency</SelectItem>
                            <SelectItem value="routine_checkup">
                                Routine Checkup
                            </SelectItem>
                            <SelectItem value="procedure">Procedure</SelectItem>
                            <SelectItem value="diagnostic">
                                Diagnostic
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Chief Complaint */}
                <div>
                    <Label htmlFor="chiefComplaint">Chief Complaint *</Label>
                    <Textarea
                        id="chiefComplaint"
                        placeholder="Main reason for visit"
                        value={formData.chiefComplaint}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                chiefComplaint: e.target.value,
                            })
                        }
                        className="mt-1"
                    />
                </div>

                {/* Symptoms */}
                <div>
                    <Label>Symptoms</Label>
                    <div className="flex gap-2 mt-1">
                        <Input
                            placeholder="Add symptom (e.g., fever, cough)"
                            value={symptomInput}
                            onChange={(e) => setSymptomInput(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleAddSymptom();
                                }
                            }}
                        />
                        <Button
                            type="button"
                            onClick={handleAddSymptom}
                            disabled={!symptomInput.trim()}>
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                    {formData.symptoms.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {formData.symptoms.map((symptom, index) => (
                                <Badge key={index} variant="secondary">
                                    {symptom}
                                    <button
                                        onClick={() =>
                                            handleRemoveSymptom(index)
                                        }
                                        className="ml-2 hover:text-destructive">
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    )}
                </div>

                {/* Vital Signs */}
                <div>
                    <Label className="mb-2 block">Vital Signs</Label>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor="bp" className="text-xs">
                                Blood Pressure
                            </Label>
                            <Input
                                id="bp"
                                placeholder="120/80"
                                value={formData.vitalSigns.bloodPressure}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        vitalSigns: {
                                            ...formData.vitalSigns,
                                            bloodPressure: e.target.value,
                                        },
                                    })
                                }
                            />
                        </div>
                        <div>
                            <Label htmlFor="hr" className="text-xs">
                                Heart Rate (bpm)
                            </Label>
                            <Input
                                id="hr"
                                type="number"
                                placeholder="72"
                                value={formData.vitalSigns.heartRate}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        vitalSigns: {
                                            ...formData.vitalSigns,
                                            heartRate: e.target.value,
                                        },
                                    })
                                }
                            />
                        </div>
                        <div>
                            <Label htmlFor="temp" className="text-xs">
                                Temperature (°F)
                            </Label>
                            <Input
                                id="temp"
                                type="number"
                                step="0.1"
                                placeholder="98.6"
                                value={formData.vitalSigns.temperature}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        vitalSigns: {
                                            ...formData.vitalSigns,
                                            temperature: e.target.value,
                                        },
                                    })
                                }
                            />
                        </div>
                        <div>
                            <Label htmlFor="weight" className="text-xs">
                                Weight (kg)
                            </Label>
                            <Input
                                id="weight"
                                type="number"
                                placeholder="70"
                                value={formData.vitalSigns.weight}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        vitalSigns: {
                                            ...formData.vitalSigns,
                                            weight: e.target.value,
                                        },
                                    })
                                }
                            />
                        </div>
                        <div>
                            <Label htmlFor="height" className="text-xs">
                                Height (cm)
                            </Label>
                            <Input
                                id="height"
                                type="number"
                                placeholder="170"
                                value={formData.vitalSigns.height}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        vitalSigns: {
                                            ...formData.vitalSigns,
                                            height: e.target.value,
                                        },
                                    })
                                }
                            />
                        </div>
                        <div>
                            <Label htmlFor="spo2" className="text-xs">
                                SpO2 (%)
                            </Label>
                            <Input
                                id="spo2"
                                type="number"
                                placeholder="98"
                                value={formData.vitalSigns.spo2}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        vitalSigns: {
                                            ...formData.vitalSigns,
                                            spo2: e.target.value,
                                        },
                                    })
                                }
                            />
                        </div>
                    </div>
                </div>

                {/* Physical Examination */}
                <div>
                    <Label htmlFor="physicalExam">Physical Examination</Label>
                    <Textarea
                        id="physicalExam"
                        placeholder="Findings from physical examination"
                        value={formData.physicalExamination}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                physicalExamination: e.target.value,
                            })
                        }
                        className="mt-1"
                        rows={3}
                    />
                </div>

                {/* Diagnosis */}
                <div>
                    <Label>Diagnosis *</Label>
                    <div className="grid sm:grid-cols-2 gap-3 mt-1">
                        <Input
                            placeholder="Condition/Disease"
                            value={diagnosisInput.condition}
                            onChange={(e) =>
                                setDiagnosisInput({
                                    ...diagnosisInput,
                                    condition: e.target.value,
                                })
                            }
                        />
                        <Select
                            value={diagnosisInput.severity}
                            onValueChange={(value) =>
                                setDiagnosisInput({
                                    ...diagnosisInput,
                                    severity: value,
                                })
                            }>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="mild">Mild</SelectItem>
                                <SelectItem value="moderate">
                                    Moderate
                                </SelectItem>
                                <SelectItem value="severe">Severe</SelectItem>
                                <SelectItem value="critical">
                                    Critical
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <Input
                            placeholder="Additional notes"
                            value={diagnosisInput.notes}
                            onChange={(e) =>
                                setDiagnosisInput({
                                    ...diagnosisInput,
                                    notes: e.target.value,
                                })
                            }
                        />
                        <Button
                            type="button"
                            onClick={handleAddDiagnosis}
                            disabled={!diagnosisInput.condition.trim()}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Diagnosis
                        </Button>
                    </div>
                    {formData.diagnosis.length > 0 && (
                        <div className="mt-3 space-y-2">
                            {formData.diagnosis.map((diag, index) => (
                                <Card
                                    key={index}
                                    className="p-3 flex justify-between items-start">
                                    <div>
                                        <p className="font-medium">
                                            {diag.condition}
                                        </p>
                                        <div className="flex gap-2 mt-1">
                                            <Badge
                                                variant={
                                                    diag.severity === "critical"
                                                        ? "destructive"
                                                        : "outline"
                                                }>
                                                {diag.severity}
                                            </Badge>
                                            {diag.notes && (
                                                <span className="text-sm text-muted-foreground">
                                                    {diag.notes}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() =>
                                            handleRemoveDiagnosis(index)
                                        }
                                        className="hover:text-destructive">
                                        <X className="h-4 w-4" />
                                    </button>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* Prescriptions */}
                <div>
                    <Label>Prescriptions</Label>
                    <div className="grid sm:grid-cols-2 gap-3 mt-1">
                        <Input
                            placeholder="Medication name *"
                            value={prescriptionInput.medication}
                            onChange={(e) =>
                                setPrescriptionInput({
                                    ...prescriptionInput,
                                    medication: e.target.value,
                                })
                            }
                        />
                        <Input
                            placeholder="Dosage (e.g., 500mg) *"
                            value={prescriptionInput.dosage}
                            onChange={(e) =>
                                setPrescriptionInput({
                                    ...prescriptionInput,
                                    dosage: e.target.value,
                                })
                            }
                        />
                        <Input
                            placeholder="Frequency (e.g., Twice daily) *"
                            value={prescriptionInput.frequency}
                            onChange={(e) =>
                                setPrescriptionInput({
                                    ...prescriptionInput,
                                    frequency: e.target.value,
                                })
                            }
                        />
                        <Input
                            placeholder="Duration (e.g., 7 days) *"
                            value={prescriptionInput.duration}
                            onChange={(e) =>
                                setPrescriptionInput({
                                    ...prescriptionInput,
                                    duration: e.target.value,
                                })
                            }
                        />
                        <Input
                            placeholder="Special instructions"
                            value={prescriptionInput.instructions}
                            onChange={(e) =>
                                setPrescriptionInput({
                                    ...prescriptionInput,
                                    instructions: e.target.value,
                                })
                            }
                            className="sm:col-span-2"
                        />
                        <Button
                            type="button"
                            onClick={handleAddPrescription}
                            className="sm:col-span-2"
                            disabled={
                                !prescriptionInput.medication.trim() ||
                                !prescriptionInput.dosage.trim() ||
                                !prescriptionInput.frequency.trim() ||
                                !prescriptionInput.duration.trim()
                            }>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Prescription
                        </Button>
                    </div>
                    {formData.prescriptions.length > 0 && (
                        <div className="mt-3 space-y-2">
                            {formData.prescriptions.map((med, index) => (
                                <Card
                                    key={index}
                                    className="p-3 flex justify-between items-start">
                                    <div>
                                        <p className="font-medium">
                                            {med.medication}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {med.dosage} • {med.frequency} •{" "}
                                            {med.duration}
                                        </p>
                                        {med.instructions && (
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {med.instructions}
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() =>
                                            handleRemovePrescription(index)
                                        }
                                        className="hover:text-destructive">
                                        <X className="h-4 w-4" />
                                    </button>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* Clinical Notes */}
                <div>
                    <Label htmlFor="clinicalNotes">Clinical Notes</Label>
                    <Textarea
                        id="clinicalNotes"
                        placeholder="Additional observations, treatment plan, and recommendations"
                        value={formData.clinicalNotes}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                clinicalNotes: e.target.value,
                            })
                        }
                        className="mt-1"
                        rows={4}
                    />
                </div>

                {/* Follow-up */}
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <input
                            type="checkbox"
                            id="followUpRequired"
                            checked={formData.followUp.required}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    followUp: {
                                        ...formData.followUp,
                                        required: e.target.checked,
                                    },
                                })
                            }
                            className="rounded"
                        />
                        <Label
                            htmlFor="followUpRequired"
                            className="cursor-pointer">
                            Follow-up Required
                        </Label>
                    </div>
                    {formData.followUp.required && (
                        <div className="grid sm:grid-cols-2 gap-4 mt-2">
                            <div>
                                <Label
                                    htmlFor="followUpDate"
                                    className="text-xs">
                                    Follow-up Date
                                </Label>
                                <Input
                                    id="followUpDate"
                                    type="date"
                                    value={formData.followUp.date}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            followUp: {
                                                ...formData.followUp,
                                                date: e.target.value,
                                            },
                                        })
                                    }
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <Label
                                    htmlFor="followUpInstructions"
                                    className="text-xs">
                                    Follow-up Instructions
                                </Label>
                                <Textarea
                                    id="followUpInstructions"
                                    placeholder="Instructions for follow-up visit"
                                    value={formData.followUp.instructions}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            followUp: {
                                                ...formData.followUp,
                                                instructions: e.target.value,
                                            },
                                        })
                                    }
                                    rows={2}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                    <Button
                        type="button"
                        className="flex-1"
                        onClick={handleSubmit}
                        disabled={
                            saving ||
                            !formData.chiefComplaint.trim() ||
                            formData.diagnosis.length === 0 ||
                            (user?.role === "hospital" && !selectedDoctorId)
                        }>
                        {saving ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            "Save Medical Record"
                        )}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={saving}>
                        Cancel
                    </Button>
                </div>
            </div>
        </Card>
    );
};

export default MedicalRecordForm;
