import { useGetDashboard, getGetDashboardQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, MessageCircle, Clock, ArrowRight, Activity, CalendarDays } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";

export default function Dashboard() {
  const { userId } = useAuth();
  
  const { data: dashboard, isLoading } = useGetDashboard(userId || "", {
    query: {
      enabled: !!userId,
      queryKey: getGetDashboardQueryKey(userId || "")
    }
  });

  if (isLoading || !dashboard) {
    return (
      <div className="space-y-8">
        <div className="space-y-4">
          <Skeleton className="h-10 w-[250px]" />
          <Skeleton className="h-6 w-[350px]" />
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-[400px] rounded-xl" />
          <Skeleton className="h-[400px] rounded-xl" />
        </div>
      </div>
    );
  }

  const nextAppointment = dashboard.upcomingAppointments[0];

  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <h1 className="font-serif text-4xl font-medium tracking-tight text-foreground">
          Good morning, {dashboard.user.name.split(' ')[0]}.
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Your health is on track. You have {dashboard.upcomingAppointments.length} upcoming {dashboard.upcomingAppointments.length === 1 ? 'appointment' : 'appointments'} scheduled.
        </p>
      </header>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-0 shadow-sm bg-card overflow-hidden relative group">
          <div className="absolute inset-0 bg-primary/5 transition-colors group-hover:bg-primary/10" />
          <CardHeader className="pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              Total Appointments
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-semibold">{dashboard.totalAppointments}</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-card overflow-hidden relative group">
          <div className="absolute inset-0 bg-chart-2/5 transition-colors group-hover:bg-chart-2/10" />
          <CardHeader className="pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-chart-2" />
              AI Consultations
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-semibold">{dashboard.totalConversations}</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-card overflow-hidden relative group">
          <div className="absolute inset-0 bg-chart-3/5 transition-colors group-hover:bg-chart-3/10" />
          <CardHeader className="pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Activity className="w-4 h-4 text-chart-3" />
              Health Status
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-semibold text-chart-3">Optimal</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Upcoming Appointments */}
        <Card className="border-border shadow-sm flex flex-col h-[420px]">
          <CardHeader className="border-b border-border/50 pb-4 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="font-serif text-xl font-medium">Upcoming Care</CardTitle>
              <CardDescription>Your scheduled visits</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
              <Link href="/appointments">View all <ArrowRight className="ml-2 w-4 h-4" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto p-0">
            {dashboard.upcomingAppointments.length > 0 ? (
              <div className="divide-y divide-border/50">
                {dashboard.upcomingAppointments.map((apt) => (
                  <div key={apt.id} className="p-6 transition-colors hover:bg-muted/50 flex gap-4">
                    <div className="flex flex-col items-center justify-center bg-primary/10 text-primary rounded-xl w-14 h-14 shrink-0">
                      <span className="text-xs font-medium uppercase">{format(parseISO(apt.date), 'MMM')}</span>
                      <span className="text-lg font-bold leading-none">{format(parseISO(apt.date), 'dd')}</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{apt.doctorName}</h4>
                      <p className="text-sm text-muted-foreground">{apt.specialty}</p>
                      <div className="flex items-center text-xs text-muted-foreground mt-2 font-medium bg-muted w-fit px-2 py-1 rounded-md">
                        <Clock className="w-3 h-3 mr-1.5" />
                        {apt.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <CalendarDays className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground font-medium mb-1">No upcoming appointments</p>
                <p className="text-sm text-muted-foreground mb-6">You're all caught up with your care plan.</p>
                <Button variant="outline" asChild>
                  <Link href="/appointments/new">Book Appointment</Link>
                </Button>
              </div>
            )}
          </CardContent>
          {dashboard.upcomingAppointments.length > 0 && (
             <div className="p-4 border-t border-border/50 sm:hidden">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/appointments">View all appointments</Link>
              </Button>
            </div>
          )}
        </Card>

        {/* Recent Conversations */}
        <Card className="border-border shadow-sm flex flex-col h-[420px]">
          <CardHeader className="border-b border-border/50 pb-4 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="font-serif text-xl font-medium">Recent AI Consultations</CardTitle>
              <CardDescription>Your chat history</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
              <Link href="/chat">New chat <ArrowRight className="ml-2 w-4 h-4" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto p-0">
            {dashboard.recentConversations.length > 0 ? (
              <div className="divide-y divide-border/50">
                {dashboard.recentConversations.map((conv) => (
                  <div key={conv.id} className="p-6 transition-colors hover:bg-muted/50">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-chart-2/10 flex items-center justify-center shrink-0">
                        <MessageCircle className="w-5 h-5 text-chart-2" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <p className="text-sm font-medium text-foreground truncate">
                            {conv.message}
                          </p>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {format(new Date(conv.createdAt), 'MMM d, h:mm a')}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                          {conv.response}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <MessageCircle className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground font-medium mb-1">No recent chats</p>
                <p className="text-sm text-muted-foreground mb-6">Have a medical question? Our AI is here to help.</p>
                <Button variant="outline" asChild>
                  <Link href="/chat">Start a Consultation</Link>
                </Button>
              </div>
            )}
          </CardContent>
          {dashboard.recentConversations.length > 0 && (
            <div className="p-4 border-t border-border/50 sm:hidden">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/chat">Continue chatting</Link>
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
