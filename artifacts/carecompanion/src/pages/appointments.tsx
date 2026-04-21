import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { 
  useGetUserAppointments, 
  getGetUserAppointmentsQueryKey,
  useCancelAppointment,
  useUpdateAppointment
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  MoreVertical,
  CalendarPlus,
  Loader2,
  Stethoscope
} from "lucide-react";
import { Link } from "wouter";
import { format, parseISO, isAfter, isToday } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

export default function Appointments() {
  const { userId } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [aptToCancel, setAptToCancel] = useState<string | null>(null);

  const { data: appointments, isLoading } = useGetUserAppointments(userId || "", {
    query: {
      enabled: !!userId,
      queryKey: getGetUserAppointmentsQueryKey(userId || "")
    }
  });

  const cancelApt = useCancelAppointment();
  const updateApt = useUpdateAppointment();

  const handleCancel = () => {
    if (!aptToCancel) return;
    
    cancelApt.mutate(
      { id: aptToCancel },
      {
        onSuccess: () => {
          toast({
            title: "Appointment cancelled",
            description: "Your appointment has been successfully cancelled.",
          });
          queryClient.invalidateQueries({
            queryKey: getGetUserAppointmentsQueryKey(userId || "")
          });
          setAptToCancel(null);
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to cancel appointment. Please try again.",
            variant: "destructive"
          });
        }
      }
    );
  };

  const handleReschedule = (id: string, newDate: string, newTime: string) => {
    updateApt.mutate(
      { id, data: { date: newDate, time: newTime } },
      {
        onSuccess: () => {
          toast({
            title: "Appointment rescheduled",
            description: "Your appointment has been successfully rescheduled.",
          });
          queryClient.invalidateQueries({
            queryKey: getGetUserAppointmentsQueryKey(userId || "")
          });
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to reschedule. Please try again.",
            variant: "destructive"
          });
        }
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-10 w-48 mb-2" />
            <Skeleton className="h-5 w-64" />
          </div>
          <Skeleton className="h-10 w-40 rounded-md" />
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      </div>
    );
  }

  const upcoming = appointments?.filter(a => a.status === 'booked' && (isAfter(parseISO(a.date), new Date()) || isToday(parseISO(a.date)))) || [];
  const past = appointments?.filter(a => a.status !== 'booked' || (!isAfter(parseISO(a.date), new Date()) && !isToday(parseISO(a.date)))) || [];

  const AppointmentCard = ({ apt, isPast = false }: { apt: any, isPast?: boolean }) => {
    const isCancelled = apt.status === 'cancelled';
    
    return (
      <Card className={`overflow-hidden transition-all duration-200 border-0 shadow-sm ${isCancelled ? 'opacity-60 bg-muted/50' : 'bg-card hover:shadow-md'}`}>
        <div className="flex flex-col sm:flex-row">
          {/* Date Column */}
          <div className={`p-6 sm:w-40 flex flex-col items-center justify-center border-b sm:border-b-0 sm:border-r border-border/50 ${isPast ? 'bg-muted' : 'bg-primary/5'}`}>
            <span className={`text-sm font-medium uppercase tracking-wider ${isPast ? 'text-muted-foreground' : 'text-primary'}`}>
              {format(parseISO(apt.date), 'MMM')}
            </span>
            <span className={`text-4xl font-bold leading-none my-1 ${isPast ? 'text-muted-foreground' : 'text-foreground'}`}>
              {format(parseISO(apt.date), 'dd')}
            </span>
            <span className="text-xs text-muted-foreground font-medium">
              {format(parseISO(apt.date), 'EEEE')}
            </span>
          </div>
          
          {/* Details Column */}
          <div className="p-6 flex-1 flex flex-col sm:flex-row justify-between gap-4">
            <div className="space-y-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-serif text-xl font-medium text-foreground">{apt.doctorName}</h3>
                  {isCancelled && <Badge variant="secondary" className="bg-destructive/10 text-destructive border-0">Cancelled</Badge>}
                  {apt.status === 'completed' && <Badge variant="secondary" className="bg-chart-3/10 text-chart-3 border-0">Completed</Badge>}
                </div>
                <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
                  <Stethoscope className="w-3.5 h-3.5" />
                  {apt.specialty}
                </p>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-muted-foreground">
                <div className="flex items-center gap-1.5 bg-muted/50 px-2.5 py-1 rounded-md">
                  <Clock className="w-4 h-4" />
                  {apt.time}
                </div>
                <div className="flex items-center gap-1.5 bg-muted/50 px-2.5 py-1 rounded-md">
                  <MapPin className="w-4 h-4" />
                  Clinic 1, Room 402
                </div>
              </div>
              
              {apt.reason && (
                <div className="text-sm text-muted-foreground border-l-2 border-border pl-3 py-1">
                  "{apt.reason}"
                </div>
              )}
            </div>
            
            {/* Actions */}
            {!isPast && !isCancelled && (
              <div className="flex sm:flex-col items-center justify-end sm:justify-start gap-2 shrink-0">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {/* Hardcoded 2 days out for demo of updateApt */}
                    <DropdownMenuItem 
                      className="cursor-pointer"
                      onClick={() => {
                        const d = new Date();
                        d.setDate(d.getDate() + 2);
                        handleReschedule(apt.id, d.toISOString().split('T')[0], apt.time);
                      }}
                    >
                      Reschedule (+2 days)
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                      onClick={() => setAptToCancel(apt.id)}
                    >
                      Cancel Appointment
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl font-medium tracking-tight">Appointments</h1>
          <p className="text-muted-foreground mt-1">Manage your scheduled care visits.</p>
        </div>
        <Button asChild className="shadow-sm shrink-0">
          <Link href="/appointments/new">
            <CalendarPlus className="w-4 h-4 mr-2" />
            Book Appointment
          </Link>
        </Button>
      </div>

      {appointments?.length === 0 ? (
        <Card className="border-dashed bg-muted/30 border-2">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mb-4 shadow-sm">
              <CalendarIcon className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-serif text-xl font-medium mb-2">No appointments yet</h3>
            <p className="text-muted-foreground max-w-sm mb-6">
              You don't have any appointments scheduled. Book a visit with one of our specialists to get started.
            </p>
            <Button asChild>
              <Link href="/appointments/new">Book Your First Visit</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-10">
          {upcoming.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-foreground flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                Upcoming
              </h2>
              <div className="grid gap-4">
                {upcoming.map(apt => (
                  <AppointmentCard key={apt.id} apt={apt} />
                ))}
              </div>
            </div>
          )}

          {past.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-muted-foreground flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                Past & Cancelled
              </h2>
              <div className="grid gap-4">
                {past.map(apt => (
                  <AppointmentCard key={apt.id} apt={apt} isPast />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <AlertDialog open={!!aptToCancel} onOpenChange={(open) => !open && setAptToCancel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Appointment?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this appointment? This action cannot be undone. 
              Our care team will be notified of the cancellation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelApt.isPending}>Keep it</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                handleCancel();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={cancelApt.isPending}
            >
              {cancelApt.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Cancelling...</>
              ) : "Yes, cancel appointment"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
