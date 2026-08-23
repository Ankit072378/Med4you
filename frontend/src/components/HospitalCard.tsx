import { Hospital } from "@/data/dummyData";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { MapPin, Star, Bed, IndianRupee, Navigation } from "lucide-react";
import { Link } from "react-router-dom";

interface HospitalCardProps {
  hospital: Hospital;
}

const HospitalCard = ({ hospital }: HospitalCardProps) => {
  return (
    <Link to={`/hospital/${hospital.id}`}>
      <Card className="overflow-hidden hover:shadow-[var(--shadow-hover)] transition-all duration-300 cursor-pointer group">
        <div className="relative h-48 overflow-hidden">
          <img 
            src={hospital.image} 
            alt={hospital.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-3 right-3 bg-card/95 backdrop-blur px-3 py-1 rounded-full flex items-center space-x-1">
            <Star className="h-4 w-4 fill-warning text-warning" />
            <span className="text-sm font-semibold">{hospital.rating}</span>
            <span className="text-xs text-muted-foreground">({hospital.reviews})</span>
          </div>
        </div>

        <div className="p-5">
          <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
            {hospital.name}
          </h3>
          
          <div className="flex items-start space-x-2 text-muted-foreground mb-3">
            <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
            <span className="text-sm">{hospital.location}, {hospital.city}</span>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {hospital.specialities.slice(0, 3).map((spec, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {spec}
              </Badge>
            ))}
            {hospital.specialities.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{hospital.specialities.length - 3} more
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <Bed className="h-4 w-4 text-success" />
                <span className="font-medium text-success">{hospital.availableBeds}</span>
                <span className="text-muted-foreground">beds</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <Navigation className="h-4 w-4 text-primary" />
                <span className="font-medium">{hospital.distance}</span>
                <span className="text-muted-foreground">km</span>
              </div>

              <div className="flex items-center space-x-1">
                <IndianRupee className="h-4 w-4 text-warning" />
                <span className="font-medium">{hospital.cost}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default HospitalCard;
