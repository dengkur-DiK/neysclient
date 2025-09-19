 // file: client/src/pages/messageslist.tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Mail, User, Calendar, MessageSquare, Trash2 } from "lucide-react";
import { Message } from "server/schema";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast"; // assuming you have this hook

export default function MessagesList() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
    queryFn: () => fetch("/api/messages").then((res) => res.json())
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/messages/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete message');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      toast({
        title: "Message Deleted",
        description: "The message was successfully removed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return <div className="text-center py-8 text-gray-400">Loading messages...</div>;
  }

  if (messages.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <MessageSquare className="w-12 h-12 mx-auto mb-4" />
        <p>No messages yet. This section will show customer inquiries.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((msg) => (
        <div key={msg.id} className="border border-gray-600 rounded-lg p-4 bg-gray-800">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-orange-500" />
                <span className="font-semibold">
                  {msg.name}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Mail className="w-4 h-4" />
                <span>{msg.email}</span>
              </div>
              <div className="text-sm">
                <span className="font-semibold text-orange-500">Message:</span>
                <p className="mt-1 text-gray-300">{msg.message}</p>
              </div>
            </div>
            <div className="text-right text-sm text-gray-400">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(msg.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="mt-1">
                {new Date(msg.createdAt).toLocaleTimeString()}
              </div>
            </div>
            {/* ADDED: Delete Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deleteMutation.mutate(msg.id)}
              disabled={deleteMutation.isPending}
              className="ml-4"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}