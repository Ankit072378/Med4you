import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthActions } from "@/hooks/useAuthActions";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import MapPicker from "./MapPicker";
import { User, Hospital, Stethoscope, Plus, X } from "lucide-react";

const Signup = () => {
    const [activeTab, setActiveTab] = useState("patient");
    const navigate = useNavigate();

    const {
        handlePatientSignup,
        handleDoctorSignup,
        handleHospitalSignup,
        loading,
        error,
        clearError,
    } = useAuthActions();

    // Patient Form State
    const [patientData, setPatientData] = useState({
        phone: "",
        password: "",
        name: "",
        age: "",
        gender: "Male",
        bloodGroup: "",
        address: "",
        emergencyContacts: [{ name: "", phone: "", relation: "" }],
    });

    // Doctor Form State
    const [doctorData, setDoctorData] = useState({
        phone: "",
        password: "",
        name: "",
        age: "",
        gender: "Male",
        type: "",
        experience: "",
        fee: "",
        qualifications: [""],
        specializations: [""],
        languages: [""],
        about: "",
        city: "",
        address: "",
        contact: { phone: "", email: "", whatsapp: "" },
    });

    // Hospital Form State
    const [hospitalData, setHospitalData] = useState({
        phone: "",
        password: "",
        name: "",
        address: "",
        city: "",
        location: { lat: "", lng: "" },
        specialities: [""],
        contacts: { phone: [""], email: [""], emergency: [""] },
    });

    // Handle Patient Submit
    const handlePatientSubmit = async (e) => {
        e.preventDefault();
        clearError();
        await handlePatientSignup(patientData);
    };

    // Handle Doctor Submit
    const handleDoctorSubmit = async (e) => {
        e.preventDefault();
        clearError();
        await handleDoctorSignup(doctorData);
    };

    // Handle Hospital Submit
    const handleHospitalSubmit = async (e) => {
        e.preventDefault();
        clearError();
        await handleHospitalSignup(hospitalData);
    };

    // Dynamic Array Handlers for Patient
    const addEmergencyContact = () => {
        setPatientData({
            ...patientData,
            emergencyContacts: [
                ...patientData.emergencyContacts,
                { name: "", phone: "", relation: "" },
            ],
        });
    };

    const removeEmergencyContact = (index) => {
        const updated = patientData.emergencyContacts.filter(
            (_, i) => i !== index
        );
        setPatientData({ ...patientData, emergencyContacts: updated });
    };

    const updateEmergencyContact = (index, field, value) => {
        const updated = [...patientData.emergencyContacts];
        updated[index][field] = value;
        setPatientData({ ...patientData, emergencyContacts: updated });
    };

    // Dynamic Array Handlers for Doctor
    const addArrayField = (field) => {
        setDoctorData({ ...doctorData, [field]: [...doctorData[field], ""] });
    };

    const removeArrayField = (field, index) => {
        const updated = doctorData[field].filter((_, i) => i !== index);
        setDoctorData({ ...doctorData, [field]: updated });
    };

    const updateArrayField = (field, index, value) => {
        const updated = [...doctorData[field]];
        updated[index] = value;
        setDoctorData({ ...doctorData, [field]: updated });
    };

    // Dynamic Array Handlers for Hospital
    const addHospitalArrayField = (field) => {
        setHospitalData({
            ...hospitalData,
            [field]: [...hospitalData[field], ""],
        });
    };

    const removeHospitalArrayField = (field, index) => {
        const updated = hospitalData[field].filter((_, i) => i !== index);
        setHospitalData({ ...hospitalData, [field]: updated });
    };

    const updateHospitalArrayField = (field, index, value) => {
        const updated = [...hospitalData[field]];
        updated[index] = value;
        setHospitalData({ ...hospitalData, [field]: updated });
    };

    const addContactField = (type) => {
        setHospitalData({
            ...hospitalData,
            contacts: {
                ...hospitalData.contacts,
                [type]: [...hospitalData.contacts[type], ""],
            },
        });
    };

    const removeContactField = (type, index) => {
        const updated = hospitalData.contacts[type].filter(
            (_, i) => i !== index
        );
        setHospitalData({
            ...hospitalData,
            contacts: { ...hospitalData.contacts, [type]: updated },
        });
    };

    const updateContactField = (type, index, value) => {
        const updated = [...hospitalData.contacts[type]];
        updated[index] = value;
        setHospitalData({
            ...hospitalData,
            contacts: { ...hospitalData.contacts, [type]: updated },
        });
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <section className="relative overflow-hidden py-12 md:py-16">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-background z-0" />

                <div className="container relative z-10 max-w-5xl">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                            Join{" "}
                            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                                Med4You
                            </span>
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            Choose your role and create your account
                        </p>
                    </div>

                    <div className="bg-card rounded-2xl shadow-[var(--shadow-soft)] border border-border p-6 md:p-8">
                        <Tabs
                            value={activeTab}
                            onValueChange={(value) => {
                                setActiveTab(value);
                                clearError();
                            }}
                            className="w-full">
                            <TabsList className="grid w-full grid-cols-3 mb-8">
                                <TabsTrigger value="patient" className="gap-2">
                                    <User className="w-4 h-4" />
                                    Patient
                                </TabsTrigger>
                                <TabsTrigger value="doctor" className="gap-2">
                                    <Stethoscope className="w-4 h-4" />
                                    Doctor
                                </TabsTrigger>
                                <TabsTrigger value="hospital" className="gap-2">
                                    <Hospital className="w-4 h-4" />
                                    Hospital
                                </TabsTrigger>
                            </TabsList>

                            {error && (
                                <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg mb-6">
                                    {error}
                                </div>
                            )}

                            {/* PATIENT FORM */}
                            <TabsContent value="patient">
                                <form
                                    onSubmit={handlePatientSubmit}
                                    className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="patient-phone">
                                                Phone Number *
                                            </Label>
                                            <Input
                                                id="patient-phone"
                                                type="tel"
                                                required
                                                value={patientData.phone}
                                                onChange={(e) =>
                                                    setPatientData({
                                                        ...patientData,
                                                        phone: e.target.value,
                                                    })
                                                }
                                                placeholder="Enter your phone"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="patient-password">
                                                Password *
                                            </Label>
                                            <Input
                                                id="patient-password"
                                                type="password"
                                                required
                                                value={patientData.password}
                                                onChange={(e) =>
                                                    setPatientData({
                                                        ...patientData,
                                                        password:
                                                            e.target.value,
                                                    })
                                                }
                                                placeholder="Create password"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="patient-name">
                                                Full Name *
                                            </Label>
                                            <Input
                                                id="patient-name"
                                                required
                                                value={patientData.name}
                                                onChange={(e) =>
                                                    setPatientData({
                                                        ...patientData,
                                                        name: e.target.value,
                                                    })
                                                }
                                                placeholder="Your full name"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="patient-age">
                                                Age *
                                            </Label>
                                            <Input
                                                id="patient-age"
                                                required
                                                value={patientData.age}
                                                onChange={(e) =>
                                                    setPatientData({
                                                        ...patientData,
                                                        age: e.target.value,
                                                    })
                                                }
                                                placeholder="Your age"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="patient-gender">
                                                Gender *
                                            </Label>
                                            <Select
                                                value={patientData.gender}
                                                onValueChange={(value) =>
                                                    setPatientData({
                                                        ...patientData,
                                                        gender: value,
                                                    })
                                                }>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Male">
                                                        Male
                                                    </SelectItem>
                                                    <SelectItem value="Female">
                                                        Female
                                                    </SelectItem>
                                                    <SelectItem value="other">
                                                        Other
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="patient-blood">
                                                Blood Group *
                                            </Label>
                                            <Input
                                                id="patient-blood"
                                                required
                                                value={patientData.bloodGroup}
                                                onChange={(e) =>
                                                    setPatientData({
                                                        ...patientData,
                                                        bloodGroup:
                                                            e.target.value,
                                                    })
                                                }
                                                placeholder="e.g., A+, O-, B+"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="patient-address">
                                            Address *
                                        </Label>
                                        <Textarea
                                            id="patient-address"
                                            required
                                            value={patientData.address}
                                            onChange={(e) =>
                                                setPatientData({
                                                    ...patientData,
                                                    address: e.target.value,
                                                })
                                            }
                                            placeholder="Your full address"
                                            rows={3}
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Label>Emergency Contacts</Label>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={addEmergencyContact}
                                                className="gap-2">
                                                <Plus className="w-4 h-4" />
                                                Add Contact
                                            </Button>
                                        </div>

                                        {patientData.emergencyContacts.map(
                                            (contact, index) => (
                                                <div
                                                    key={index}
                                                    className="grid md:grid-cols-4 gap-4 p-4 border border-border rounded-lg">
                                                    <Input
                                                        placeholder="Name"
                                                        value={contact.name}
                                                        onChange={(e) =>
                                                            updateEmergencyContact(
                                                                index,
                                                                "name",
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                    <Input
                                                        placeholder="Phone"
                                                        value={contact.phone}
                                                        onChange={(e) =>
                                                            updateEmergencyContact(
                                                                index,
                                                                "phone",
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                    <Input
                                                        placeholder="Relation"
                                                        value={contact.relation}
                                                        onChange={(e) =>
                                                            updateEmergencyContact(
                                                                index,
                                                                "relation",
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                    {index > 0 && (
                                                        <Button
                                                            type="button"
                                                            variant="destructive"
                                                            size="icon"
                                                            onClick={() =>
                                                                removeEmergencyContact(
                                                                    index
                                                                )
                                                            }>
                                                            <X className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            )
                                        )}
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
                                        disabled={loading}>
                                        {loading
                                            ? "Creating Account..."
                                            : "Sign Up as Patient"}
                                    </Button>
                                </form>
                            </TabsContent>

                            {/* DOCTOR FORM */}
                            <TabsContent value="doctor">
                                <form
                                    onSubmit={handleDoctorSubmit}
                                    className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="doctor-phone">
                                                Phone Number *
                                            </Label>
                                            <Input
                                                id="doctor-phone"
                                                type="tel"
                                                required
                                                value={doctorData.phone}
                                                onChange={(e) =>
                                                    setDoctorData({
                                                        ...doctorData,
                                                        phone: e.target.value,
                                                    })
                                                }
                                                placeholder="Enter your phone"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="doctor-password">
                                                Password *
                                            </Label>
                                            <Input
                                                id="doctor-password"
                                                type="password"
                                                required
                                                value={doctorData.password}
                                                onChange={(e) =>
                                                    setDoctorData({
                                                        ...doctorData,
                                                        password:
                                                            e.target.value,
                                                    })
                                                }
                                                placeholder="Create password"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="doctor-name">
                                                Full Name *
                                            </Label>
                                            <Input
                                                id="doctor-name"
                                                required
                                                value={doctorData.name}
                                                onChange={(e) =>
                                                    setDoctorData({
                                                        ...doctorData,
                                                        name: e.target.value,
                                                    })
                                                }
                                                placeholder="Dr. Your Name"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="doctor-age">
                                                Age *
                                            </Label>
                                            <Input
                                                id="doctor-age"
                                                required
                                                value={doctorData.age}
                                                onChange={(e) =>
                                                    setDoctorData({
                                                        ...doctorData,
                                                        age: e.target.value,
                                                    })
                                                }
                                                placeholder="Your age"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="doctor-gender">
                                                Gender
                                            </Label>
                                            <Select
                                                value={doctorData.gender}
                                                onValueChange={(value) =>
                                                    setDoctorData({
                                                        ...doctorData,
                                                        gender: value,
                                                    })
                                                }>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Male">
                                                        Male
                                                    </SelectItem>
                                                    <SelectItem value="Female">
                                                        Female
                                                    </SelectItem>
                                                    <SelectItem value="Other">
                                                        Other
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="doctor-type">
                                                Specialization *
                                            </Label>
                                            <Input
                                                id="doctor-type"
                                                required
                                                value={doctorData.type}
                                                onChange={(e) =>
                                                    setDoctorData({
                                                        ...doctorData,
                                                        type: e.target.value,
                                                    })
                                                }
                                                placeholder="e.g., Cardiologist"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="doctor-experience">
                                                Experience (years) *
                                            </Label>
                                            <Input
                                                id="doctor-experience"
                                                type="number"
                                                required
                                                value={doctorData.experience}
                                                onChange={(e) =>
                                                    setDoctorData({
                                                        ...doctorData,
                                                        experience:
                                                            e.target.value,
                                                    })
                                                }
                                                placeholder="Years of experience"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="doctor-fee">
                                                Consultation Fee (₹) *
                                            </Label>
                                            <Input
                                                id="doctor-fee"
                                                type="number"
                                                required
                                                value={doctorData.fee}
                                                onChange={(e) =>
                                                    setDoctorData({
                                                        ...doctorData,
                                                        fee: e.target.value,
                                                    })
                                                }
                                                placeholder="e.g., 500"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="doctor-city">
                                                City
                                            </Label>
                                            <Input
                                                id="doctor-city"
                                                value={doctorData.city}
                                                onChange={(e) =>
                                                    setDoctorData({
                                                        ...doctorData,
                                                        city: e.target.value,
                                                    })
                                                }
                                                placeholder="Your city"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="doctor-email">
                                                Email
                                            </Label>
                                            <Input
                                                id="doctor-email"
                                                type="email"
                                                value={doctorData.contact.email}
                                                onChange={(e) =>
                                                    setDoctorData({
                                                        ...doctorData,
                                                        contact: {
                                                            ...doctorData.contact,
                                                            email: e.target
                                                                .value,
                                                        },
                                                    })
                                                }
                                                placeholder="your@email.com"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="doctor-address">
                                            Clinic Address
                                        </Label>
                                        <Textarea
                                            id="doctor-address"
                                            value={doctorData.address}
                                            onChange={(e) =>
                                                setDoctorData({
                                                    ...doctorData,
                                                    address: e.target.value,
                                                })
                                            }
                                            placeholder="Clinic address"
                                            rows={2}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="doctor-about">
                                            About
                                        </Label>
                                        <Textarea
                                            id="doctor-about"
                                            value={doctorData.about}
                                            onChange={(e) =>
                                                setDoctorData({
                                                    ...doctorData,
                                                    about: e.target.value,
                                                })
                                            }
                                            placeholder="Brief description about you"
                                            rows={3}
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Label>Qualifications</Label>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    addArrayField(
                                                        "qualifications"
                                                    )
                                                }
                                                className="gap-2">
                                                <Plus className="w-4 h-4" />
                                                Add
                                            </Button>
                                        </div>
                                        {doctorData.qualifications.map(
                                            (qual, index) => (
                                                <div
                                                    key={index}
                                                    className="flex gap-2">
                                                    <Input
                                                        placeholder="e.g., MBBS, MD"
                                                        value={qual}
                                                        onChange={(e) =>
                                                            updateArrayField(
                                                                "qualifications",
                                                                index,
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                    {index > 0 && (
                                                        <Button
                                                            type="button"
                                                            variant="destructive"
                                                            size="icon"
                                                            onClick={() =>
                                                                removeArrayField(
                                                                    "qualifications",
                                                                    index
                                                                )
                                                            }>
                                                            <X className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            )
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Label>Languages</Label>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    addArrayField("languages")
                                                }
                                                className="gap-2">
                                                <Plus className="w-4 h-4" />
                                                Add
                                            </Button>
                                        </div>
                                        {doctorData.languages.map(
                                            (lang, index) => (
                                                <div
                                                    key={index}
                                                    className="flex gap-2">
                                                    <Input
                                                        placeholder="e.g., Hindi, English"
                                                        value={lang}
                                                        onChange={(e) =>
                                                            updateArrayField(
                                                                "languages",
                                                                index,
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                    {index > 0 && (
                                                        <Button
                                                            type="button"
                                                            variant="destructive"
                                                            size="icon"
                                                            onClick={() =>
                                                                removeArrayField(
                                                                    "languages",
                                                                    index
                                                                )
                                                            }>
                                                            <X className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            )
                                        )}
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
                                        disabled={loading}>
                                        {loading
                                            ? "Creating Account..."
                                            : "Sign Up as Doctor"}
                                    </Button>
                                </form>
                            </TabsContent>

                            {/* HOSPITAL FORM */}
                            <TabsContent value="hospital">
                                {activeTab === "hospital" && (
                                    <>
                                        <form
                                            onSubmit={handleHospitalSubmit}
                                            className="space-y-6">
                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <Label htmlFor="hospital-phone">
                                                        Phone Number *
                                                    </Label>
                                                    <Input
                                                        id="hospital-phone"
                                                        type="tel"
                                                        required
                                                        value={
                                                            hospitalData.phone
                                                        }
                                                        onChange={(e) =>
                                                            setHospitalData({
                                                                ...hospitalData,
                                                                phone: e.target
                                                                    .value,
                                                            })
                                                        }
                                                        placeholder="Hospital phone"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="hospital-password">
                                                        Password *
                                                    </Label>
                                                    <Input
                                                        id="hospital-password"
                                                        type="password"
                                                        required
                                                        value={
                                                            hospitalData.password
                                                        }
                                                        onChange={(e) =>
                                                            setHospitalData({
                                                                ...hospitalData,
                                                                password:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }
                                                        placeholder="Create password"
                                                    />
                                                </div>

                                                <div className="space-y-2 md:col-span-2">
                                                    <Label htmlFor="hospital-name">
                                                        Hospital Name *
                                                    </Label>
                                                    <Input
                                                        id="hospital-name"
                                                        required
                                                        value={
                                                            hospitalData.name
                                                        }
                                                        onChange={(e) =>
                                                            setHospitalData({
                                                                ...hospitalData,
                                                                name: e.target
                                                                    .value,
                                                            })
                                                        }
                                                        placeholder="Hospital name"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="hospital-city">
                                                        City *
                                                    </Label>
                                                    <Input
                                                        id="hospital-city"
                                                        required
                                                        value={
                                                            hospitalData.city
                                                        }
                                                        onChange={(e) =>
                                                            setHospitalData({
                                                                ...hospitalData,
                                                                city: e.target
                                                                    .value,
                                                            })
                                                        }
                                                        placeholder="City name"
                                                    />
                                                </div>

                                                <div className="md:col-span-2 space-y-2">
                                                    <Label>
                                                        Hospital Location *
                                                    </Label>

                                                    <MapPicker
                                                        location={
                                                            hospitalData.location
                                                        }
                                                        setLocation={(loc) =>
                                                            setHospitalData({
                                                                ...hospitalData,
                                                                location: loc,
                                                            })
                                                        }
                                                    />

                                                    <div className="flex gap-4 mt-2">
                                                        <Input
                                                            value={
                                                                hospitalData
                                                                    .location
                                                                    .lat
                                                            }
                                                            placeholder="Latitude"
                                                            readOnly
                                                        />
                                                        <Input
                                                            value={
                                                                hospitalData
                                                                    .location
                                                                    .lng
                                                            }
                                                            placeholder="Longitude"
                                                            readOnly
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="hospital-address">
                                                    Address
                                                </Label>
                                                <Textarea
                                                    id="hospital-address"
                                                    value={hospitalData.address}
                                                    onChange={(e) =>
                                                        setHospitalData({
                                                            ...hospitalData,
                                                            address:
                                                                e.target.value,
                                                        })
                                                    }
                                                    placeholder="Full address"
                                                    rows={3}
                                                />
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <Label>Specialities</Label>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            addHospitalArrayField(
                                                                "specialities"
                                                            )
                                                        }
                                                        className="gap-2">
                                                        <Plus className="w-4 h-4" />
                                                        Add
                                                    </Button>
                                                </div>
                                                {hospitalData.specialities.map(
                                                    (spec, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex gap-2">
                                                            <Input
                                                                placeholder="e.g., Cardiology, Neurology"
                                                                value={spec}
                                                                onChange={(e) =>
                                                                    updateHospitalArrayField(
                                                                        "specialities",
                                                                        index,
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                            />
                                                            {index > 0 && (
                                                                <Button
                                                                    type="button"
                                                                    variant="destructive"
                                                                    size="icon"
                                                                    onClick={() =>
                                                                        removeHospitalArrayField(
                                                                            "specialities",
                                                                            index
                                                                        )
                                                                    }>
                                                                    <X className="w-4 h-4" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    )
                                                )}
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <Label>
                                                        Contact Numbers
                                                    </Label>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            addContactField(
                                                                "phone"
                                                            )
                                                        }
                                                        className="gap-2">
                                                        <Plus className="w-4 h-4" />
                                                        Add
                                                    </Button>
                                                </div>
                                                {hospitalData.contacts.phone.map(
                                                    (phone, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex gap-2">
                                                            <Input
                                                                placeholder="Contact number"
                                                                value={phone}
                                                                onChange={(e) =>
                                                                    updateContactField(
                                                                        "phone",
                                                                        index,
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                            />
                                                            {index > 0 && (
                                                                <Button
                                                                    type="button"
                                                                    variant="destructive"
                                                                    size="icon"
                                                                    onClick={() =>
                                                                        removeContactField(
                                                                            "phone",
                                                                            index
                                                                        )
                                                                    }>
                                                                    <X className="w-4 h-4" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    )
                                                )}
                                            </div>

                                            <Button
                                                type="submit"
                                                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
                                                disabled={loading}>
                                                {loading
                                                    ? "Creating Account..."
                                                    : "Sign Up as Hospital"}
                                            </Button>
                                        </form>
                                    </>
                                )}
                            </TabsContent>
                        </Tabs>

                        <div className="text-center mt-6">
                            <p className="text-sm text-muted-foreground">
                                Already have an account?{" "}
                                <button
                                    onClick={() => navigate("/login")}
                                    className="text-primary hover:underline font-medium">
                                    Login here
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Signup;