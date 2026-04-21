import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { 
  useGetConversations, 
  getGetConversationsQueryKey,
  useSendChatMessage
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "wouter";
import { Send, Bot, User, Loader2, CalendarPlus, Stethoscope } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Chat() {
  const { userId } = useAuth();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data: conversations, isLoading } = useGetConversations(userId || "", {
    query: {
      enabled: !!userId,
      queryKey: getGetConversationsQueryKey(userId || "")
    }
  });

  const sendChat = useSendChatMessage();

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversations, sendChat.isPending]);

  // Adjust textarea height
  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`;
  };

  const handleSend = () => {
    if (!message.trim() || !userId) return;
    
    sendChat.mutate(
      {
        data: { userId, message: message.trim() }
      },
      {
        onSuccess: () => {
          setMessage("");
          if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
          }
          queryClient.invalidateQueries({
            queryKey: getGetConversationsQueryKey(userId)
          });
        }
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-6rem)] md:h-[calc(100vh-8rem)] flex flex-col">
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-medium tracking-tight">Care Chat</h1>
        <p className="text-muted-foreground mt-1">Available 24/7 for health guidance and triage.</p>
      </div>

      <Card className="flex-1 flex flex-col border-0 shadow-sm overflow-hidden bg-card/80 backdrop-blur-xl">
        <CardContent className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {conversations?.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                <Bot className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-serif text-xl font-medium mb-2">How can we help today?</h3>
              <p className="text-muted-foreground mb-8">
                Describe your symptoms, ask a medical question, or request help scheduling an appointment. 
                Our AI is trained on clinical protocols to provide precise guidance.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                <Button 
                  variant="outline" 
                  className="h-auto py-3 px-4 justify-start text-left whitespace-normal font-normal"
                  onClick={() => setMessage("I have a persistent headache and slight fever.")}
                >
                  I have a persistent headache...
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto py-3 px-4 justify-start text-left whitespace-normal font-normal"
                  onClick={() => setMessage("I need to schedule an annual physical checkup.")}
                >
                  I need an annual physical...
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {conversations?.map((conv) => (
                <div key={conv.id} className="space-y-6">
                  {/* User Message */}
                  <div className="flex justify-end items-start gap-3">
                    <div className="max-w-[80%] bg-primary text-primary-foreground px-5 py-3.5 rounded-2xl rounded-tr-sm shadow-sm">
                      <p className="text-[15px] leading-relaxed">{conv.message}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-1">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                  </div>

                  {/* AI Response */}
                  <div className="flex justify-start items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-chart-2/20 flex items-center justify-center shrink-0 mt-1">
                      <Bot className="w-4 h-4 text-chart-2" />
                    </div>
                    <div className="max-w-[80%] bg-muted px-5 py-3.5 rounded-2xl rounded-tl-sm text-foreground">
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{conv.response}</p>
                      </div>
                      
                      {/* Handle suggestions natively if API returns them in the string or as a structured field (using string matching here since we only have standard response field from API) */}
                      {(conv.response.toLowerCase().includes('schedule') || 
                        conv.response.toLowerCase().includes('appointment') || 
                        conv.response.toLowerCase().includes('doctor') ||
                        conv.response.toLowerCase().includes('visit')) && (
                        <div className="mt-4 pt-4 border-t border-border/50">
                          <Button 
                            variant="secondary" 
                            className="bg-background hover:bg-background/80 shadow-sm"
                            asChild
                          >
                            <Link href="/appointments/new">
                              <CalendarPlus className="w-4 h-4 mr-2" />
                              Book an Appointment
                            </Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Pending State */}
              {sendChat.isPending && (
                <div className="flex justify-start items-start gap-3 animate-in fade-in">
                  <div className="w-8 h-8 rounded-full bg-chart-2/20 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-chart-2" />
                  </div>
                  <div className="bg-muted px-5 py-4 rounded-2xl rounded-tl-sm flex gap-1.5 items-center h-12">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>

        <CardFooter className="p-3 md:p-4 border-t border-border bg-background/50">
          <form 
            className="flex items-end gap-2 w-full max-w-4xl mx-auto"
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          >
            <div className="relative flex-1">
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={handleTextareaInput}
                onKeyDown={handleKeyDown}
                placeholder="Message CareCompanion..."
                className="min-h-[52px] max-h-[150px] resize-none pr-12 py-3.5 bg-background shadow-sm rounded-xl focus-visible:ring-1"
                disabled={sendChat.isPending}
              />
              <Button 
                type="submit" 
                size="icon" 
                className={cn(
                  "absolute right-2 bottom-2 h-9 w-9 rounded-lg transition-all duration-200",
                  message.trim() ? "opacity-100 scale-100" : "opacity-50 scale-95"
                )}
                disabled={!message.trim() || sendChat.isPending}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
