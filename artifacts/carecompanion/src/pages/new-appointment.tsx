import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateAppointment, getGetUserAppointmentsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, Calendar as CalendarIcon } from "lucide-react";
import { Link } from "wouter";

const formSchema = z.object({
  specialty: z.string().min(1, "Please select a specialty"),
  doctorName: z.string().min(1, "Please select a doctor"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
  reason: z.string().optional(),
});

const doctorsBySpecialty: Record<string, string[]> = {
  "Primary Care": ["Dr. Sarah Chen", "Dr. Michael Torres"],
  "Cardiology": ["Dr. Robert Patel", "Dr. Emily Wong"],
  "Dermatology": ["Dr. James Wilson", "Dr. Lisa Kumar"],
  "Neurology": ["Dr. David Kim"],
};

const availableTimes = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", 
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00"
];

export default function NewAppointment() {
  const { userId } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const createApt = useCreateAppointment();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      specialty: "",
      doctorName: "",
      date: "",
      time: "",
      reason: "",
    },
  });

  const selectedSpecialty = form.watch("specialty");

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!userId) return;

    createApt.mutate(
      {
        data: {
          userId,
          doctorName: values.doctorName,
          specialty: values.specialty,
          date: values.date,
          time: values.time,
          reason: values.reason || undefined,
        }
      },
      {
        onSuccess: () => {
          toast({
            title: "Appointment Booked",
            description: `Scheduled with ${values.doctorName} for ${values.date} at ${values.time}.`,
          });
          queryClient.invalidateQueries({
            queryKey: getGetUserAppointmentsQueryKey(userId)
          });
          setLocation("/appointments");
        },
        onError: () => {
          toast({
            title: "Booking Failed",
            description: "There was an error scheduling your appointment. Please try again.",
            variant: "destructive"
          });
        }
      }
    );
  }

  // Get next 14 days for date selection
  const upcomingDates = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1); // Start from tomorrow
    // Skip weekends for simplicity
    if (d.getDay() === 0 || d.getDay() === 6) return null;
    return d.toISOString().split('T')[0];
  }).filter(Boolean) as string[];

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="shrink-0 -ml-2 text-muted-foreground">
          <Link href="/appointments"><ArrowLeft className="w-5 h-5" /></Link>
        </Button>
        <div>
          <h1 className="font-serif text-3xl font-medium tracking-tight">Book Visit</h1>
          <p className="text-muted-foreground mt-1">Schedule care with our clinical team.</p>
        </div>
      </div>

      <Card className="border-0 shadow-md bg-card/80 backdrop-blur-xl">
        <CardHeader className="border-b border-border/50 pb-6">
          <CardTitle className="flex items-center gap-2 text-xl">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <CalendarIcon className="w-4 h-4 text-primary" />
            </div>
            Appointment Details
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="specialty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Clinical Specialty</FormLabel>
                      <Select 
                        onValueChange={(val) => {
                          field.onChange(val);
                          form.setValue("doctorName", ""); // Reset doctor when specialty changes
                        }} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Select specialty" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.keys(doctorsBySpecialty).map(spec => (
                            <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="doctorName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Provider</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={!selectedSpecialty}>
                        <FormControl>
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder={selectedSpecialty ? "Select provider" : "Select specialty first"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {selectedSpecialty && doctorsBySpecialty[selectedSpecialty]?.map(doc => (
                            <SelectItem key={doc} value={doc}>{doc}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Select date" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {upcomingDates.map(date => {
                            const d = new Date(date + 'T12:00:00Z');
                            return (
                              <SelectItem key={date} value={date}>
                                {d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableTimes.map(time => (
                            <SelectItem key={time} value={time}>
                              {new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason for Visit (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Briefly describe your symptoms or reason for the visit..." 
                        className="resize-none min-h-[100px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      This helps your provider prepare for your consultation.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-4 border-t border-border/50 flex justify-end gap-3">
                <Button variant="outline" type="button" asChild>
                  <Link href="/appointments">Cancel</Link>
                </Button>
                <Button type="submit" disabled={createApt.isPending} className="px-8 shadow-sm">
                  {createApt.isPending ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Scheduling...</>
                  ) : "Confirm Booking"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
