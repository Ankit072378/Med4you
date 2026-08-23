import { useState, useEffect } from "react";
import { useQueueActions } from "@/hooks/useQueueActions";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Clock, Activity, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const LiveQueueDisplay = ({
    doctorId,
    showRefresh = true,
    compact = false,
}) => {
    const { handleGetLiveQueue } = useQueueActions();
    const [queue, setQueue] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchQueue = async () => {
        setLoading(true);
        const today = new Date().toISOString().split("T")[0];
        const result = await handleGetLiveQueue(doctorId, today);
        if (result.success) {
            setQueue(result.data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchQueue();
        const interval = setInterval(fetchQueue, 30000); // Refresh every 30s
        return () => clearInterval(interval);
    }, [doctorId]);

    if (loading && !queue) {
        return (
            <Card className="p-5">
                <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-muted rounded w-1/3"></div>
                    <div className="h-8 bg-muted rounded"></div>
                </div>
            </Card>
        );
    }

    if (!queue) return null;

    if (compact) {
        return (
            <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-normal">
                        Token #{queue.currentTokenNumber}
                    </Badge>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{queue.waitingPatients} waiting</span>
                </div>
                <Badge
                    variant={
                        queue.doctorStatus === "available"
                            ? "default"
                            : "secondary"
                    }>
                    {queue.doctorStatus}
                </Badge>
            </div>
        );
    }

    return (
        <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold">Live Queue Status</h3>
                {showRefresh && (
                    <Button variant="ghost" size="sm" onClick={fetchQueue}>
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                    <p className="text-xs text-muted-foreground mb-1">
                        Current Token
                    </p>
                    <p className="text-2xl font-bold text-primary">
                        {queue.currentTokenNumber}
                    </p>
                </div>
                <div>
                    <p className="text-xs text-muted-foreground mb-1">
                        Waiting
                    </p>
                    <p className="text-2xl font-bold text-orange-500">
                        {queue.waitingPatients}
                    </p>
                </div>
                <div>
                    <p className="text-xs text-muted-foreground mb-1">
                        Completed
                    </p>
                    <p className="text-2xl font-bold text-success">
                        {queue.completedPatients}
                    </p>
                </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Avg. {queue.averageConsultationTime} min</span>
                </div>
                <Badge
                    variant={
                        queue.doctorStatus === "available"
                            ? "default"
                            : queue.doctorStatus === "busy"
                            ? "secondary"
                            : "outline"
                    }>
                    <Activity className="h-3 w-3 mr-1" />
                    {queue.doctorStatus}
                </Badge>
            </div>
        </Card>
    );
};

export default LiveQueueDisplay;