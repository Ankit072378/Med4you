import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Users, CheckCircle, AlertCircle, Calendar } from "lucide-react";
import { doctors, hospitals } from "@/data/dummyData";

const QueueTracking = () => {
  const [selectedHospital, setSelectedHospital] = useState(hospitals[0].id);
  const hospital = hospitals.find(h => h.id === selectedHospital);
  const hospitalDoctors = doctors.filter(d => d.hospitalId === selectedHospital);

  // Simulate queue data
  const queueData = hospitalDoctors.map(doctor => ({
    ...doctor,
    currentQueue: Math.floor(Math.random() * 15) + 1,
    avgWaitTime: Math.floor(Math.random() * 30) + 10,
    todayPatients: Math.floor(Math.random() * 40) + 10,
    status: doctor.available ? 'available' : 'unavailable'
  }));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Live Queue Tracking
          </h1>
          <p className="text-muted-foreground">
            Check doctor availability and patient queue in real-time
          </p>
        </div>

        <div className="mb-6">
          <Select value={selectedHospital} onValueChange={setSelectedHospital}>
            <SelectTrigger className="w-full md:w-96">
              <SelectValue placeholder="Select hospital" />
            </SelectTrigger>
            <SelectContent>
              {hospitals.map(h => (
                <SelectItem key={h.id} value={h.id}>
                  {h.name} - {h.city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {hospital && (
          <Card className="p-6 mb-8 bg-gradient-to-br from-card to-muted/20">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">{hospital.name}</h2>
                <p className="text-muted-foreground">{hospital.location}, {hospital.city}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary">{queueData.length}</div>
                <div className="text-sm text-muted-foreground">Doctors Available</div>
              </div>
            </div>
          </Card>
        )}

        <div className="grid gap-6">
          {queueData.map((doctor) => (
            <Card key={doctor.id} className="overflow-hidden">
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  {/* Doctor Info */}
                  <div className="flex items-start space-x-4 flex-1">
                    <img 
                      src={doctor.photo} 
                      alt={doctor.name}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-foreground mb-1">
                        {doctor.name}
                      </h3>
                      <p className="text-primary font-medium mb-2">{doctor.speciality}</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge className={doctor.status === 'available' ? 'bg-success' : 'bg-destructive'}>
                          {doctor.status === 'available' ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Available Now
                            </>
                          ) : (
                            <>
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Not Available
                            </>
                          )}
                        </Badge>
                        <Badge variant="outline">
                          <Calendar className="h-3 w-3 mr-1" />
                          {doctor.workingDays.join(", ")}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Queue Stats */}
                  <div className="grid grid-cols-3 gap-4 md:gap-6">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div className="text-2xl font-bold text-foreground">{doctor.currentQueue}</div>
                      <div className="text-xs text-muted-foreground">In Queue</div>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Clock className="h-5 w-5 text-warning" />
                      </div>
                      <div className="text-2xl font-bold text-foreground">{doctor.avgWaitTime}</div>
                      <div className="text-xs text-muted-foreground">Min Wait</div>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <CheckCircle className="h-5 w-5 text-success" />
                      </div>
                      <div className="text-2xl font-bold text-foreground">{doctor.todayPatients}</div>
                      <div className="text-xs text-muted-foreground">Today</div>
                    </div>
                  </div>
                </div>

                {/* Working Hours */}
                <div className="mt-6 pt-6 border-t border-border">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Working Hours: {doctor.workingHours}</span>
                    </div>
                    <Button 
                      disabled={doctor.status !== 'available'}
                      className="bg-gradient-to-r from-primary to-accent"
                    >
                      Book Appointment
                    </Button>
                  </div>
                </div>
              </div>

              {/* Queue Status Bar */}
              {doctor.status === 'available' && (
                <div className="bg-muted px-6 py-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Queue Status:</span>
                    <span className={`font-medium ${
                      doctor.currentQueue < 5 ? 'text-success' : 
                      doctor.currentQueue < 10 ? 'text-warning' : 'text-destructive'
                    }`}>
                      {doctor.currentQueue < 5 ? 'Low' : doctor.currentQueue < 10 ? 'Moderate' : 'High'} wait time
                    </span>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>

        <Card className="mt-8 p-6 bg-muted/50">
          <h3 className="font-semibold text-foreground mb-4">Why Queue Tracking Matters:</h3>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex items-start space-x-3">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
              <span>Avoid wasting time traveling to hospitals when doctors aren't available</span>
            </li>
            <li className="flex items-start space-x-3">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
              <span>Plan your visit based on current queue and wait times</span>
            </li>
            <li className="flex items-start space-x-3">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
              <span>Reduce overcrowding at hospitals by distributing patients better</span>
            </li>
            <li className="flex items-start space-x-3">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
              <span>Make informed decisions about which doctor to visit today</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default QueueTracking;
