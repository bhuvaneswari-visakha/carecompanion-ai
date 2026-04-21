import { useAuth } from "@/hooks/use-auth";
import { 
  useGetUser, 
  getGetUserQueryKey, 
  useListUsers, 
  getListUsersQueryKey 
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "wouter";
import { User, Mail, Phone, LogOut, Shield, Users } from "lucide-react";
import { format } from "date-fns";

export default function Profile() {
  const { userId, logout, login } = useAuth();
  const [, setLocation] = useLocation();

  const { data: user, isLoading: isLoadingUser } = useGetUser(userId || "", {
    query: {
      enabled: !!userId,
      queryKey: getGetUserQueryKey(userId || "")
    }
  });

  const { data: users, isLoading: isLoadingUsers } = useListUsers({
    query: {
      queryKey: getListUsersQueryKey()
    }
  });

  const handleLogout = () => {
    logout();
    setLocation("/onboarding");
  };

  const handleSwitchUser = (id: string) => {
    login(id);
    setLocation("/");
  };

  if (isLoadingUser || !user) {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <Skeleton className="h-10 w-48 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-medium tracking-tight">Patient Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your account and preferences.</p>
      </div>

      <Card className="border-0 shadow-sm bg-card/80 overflow-hidden">
        <div className="h-24 bg-primary/10 relative">
          <div className="absolute -bottom-10 left-6 w-20 h-20 bg-background rounded-2xl border-4 border-background flex items-center justify-center shadow-sm">
            <User className="w-8 h-8 text-muted-foreground" />
          </div>
        </div>
        <CardHeader className="pt-14 pb-4">
          <CardTitle className="text-2xl font-serif">{user.name}</CardTitle>
          <CardDescription>
            Patient since {format(new Date(user.createdAt), 'MMMM yyyy')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground uppercase tracking-wider">Contact Information</h3>
            
            <div className="bg-muted/30 rounded-xl p-4 space-y-4 border border-border/50">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center shrink-0 shadow-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Email Address</p>
                  <p className="text-muted-foreground">{user.email || "Not provided"}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center shrink-0 shadow-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Phone Number</p>
                  <p className="text-muted-foreground">{user.phone || "Not provided"}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground uppercase tracking-wider">Privacy & Security</h3>
            <div className="bg-muted/30 rounded-xl p-4 border border-border/50 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center shrink-0 shadow-sm">
                  <Shield className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">HIPAA Compliant</p>
                  <p className="text-xs text-muted-foreground">Your data is securely encrypted</p>
                </div>
              </div>
              <Badge variant="outline" className="bg-background">Active</Badge>
            </div>
          </div>

          {users && users.length > 1 && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4" />
                Switch Patient
              </h3>
              <div className="bg-muted/30 rounded-xl p-2 border border-border/50 flex flex-col gap-1">
                {users.map(u => (
                  <Button 
                    key={u.id}
                    variant={u.id === userId ? "secondary" : "ghost"}
                    className="justify-start"
                    disabled={u.id === userId}
                    onClick={() => handleSwitchUser(u.id)}
                  >
                    {u.name} {u.id === userId && "(Current)"}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="pt-6 border-t border-border/50">
            <Button 
              variant="destructive" 
              className="w-full bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors border-0"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
