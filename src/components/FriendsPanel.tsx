import { useState } from "react";
import { Users, Check, X, MessageCircle, UserMinus, Clock } from "lucide-react";
import { useFriends, Friend } from "@/contexts/FriendsContext";
import UserAvatar from "@/components/UserAvatar";
import DirectChatPanel from "@/components/DirectChatPanel";

const FriendsPanel = () => {
  const { accepted, pendingReceived, pendingSent, loading, acceptRequest, rejectRequest, removeFriend } = useFriends();
  const [chat, setChat] = useState<{ userId: string; name: string; avatarUrl: string | null } | null>(null);

  if (chat) {
    return (
      <DirectChatPanel
        friendId={chat.userId}
        friendName={chat.name}
        friendAvatarUrl={chat.avatarUrl}
        onBack={() => setChat(null)}
      />
    );
  }

  const FriendRow = ({ f, actions }: { f: Friend; actions: React.ReactNode }) => (
    <div className="flex items-center gap-3 py-3 border-b border-border/40 last:border-0">
      <div className="w-10 h-10 rounded-full overflow-hidden bg-muted flex-shrink-0">
        <UserAvatar avatarUrl={f.avatarUrl} displayName={f.displayName} className="w-full h-full" />
      </div>
      <span className="flex-1 font-medium text-sm text-foreground truncate">{f.displayName}</span>
      <div className="flex items-center gap-1.5 flex-shrink-0">{actions}</div>
    </div>
  );

  const btnBase = "p-2 rounded-lg transition-colors";

  return (
    <div className="space-y-4">
      {/* Pending requests received */}
      {pendingReceived.length > 0 && (
        <div className="bg-card rounded-xl p-4 shadow-md">
          <h3 className="font-bold text-sm text-foreground mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            Pedidos recebidos ({pendingReceived.length})
          </h3>
          {pendingReceived.map((f) => (
            <FriendRow
              key={f.friendshipId}
              f={f}
              actions={
                <>
                  <button
                    onClick={() => acceptRequest(f.friendshipId)}
                    className={`${btnBase} bg-green-500/15 hover:bg-green-500/30 text-green-600`}
                    title="Aceitar"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => rejectRequest(f.friendshipId)}
                    className={`${btnBase} bg-red-500/10 hover:bg-red-500/20 text-red-500`}
                    title="Recusar"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              }
            />
          ))}
        </div>
      )}

      {/* Accepted friends */}
      <div className="bg-card rounded-xl p-4 shadow-md">
        <h3 className="font-bold text-sm text-foreground mb-3 flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          Amigos ({accepted.length})
        </h3>

        {loading && (
          <p className="text-center text-xs text-muted-foreground py-4">Carregando...</p>
        )}

        {!loading && accepted.length === 0 && pendingReceived.length === 0 && pendingSent.length === 0 && (
          <div className="text-center py-8 flex flex-col items-center gap-2">
            <span className="text-4xl">👥</span>
            <p className="text-sm text-muted-foreground">Nenhum amigo ainda.</p>
            <p className="text-xs text-muted-foreground">
              Encontre trocadores por perto e adicione-os como amigos!
            </p>
          </div>
        )}

        {accepted.map((f) => (
          <FriendRow
            key={f.friendshipId}
            f={f}
            actions={
              <>
                <button
                  onClick={() => setChat({ userId: f.userId, name: f.displayName, avatarUrl: f.avatarUrl })}
                  className={`${btnBase} bg-primary/10 hover:bg-primary/20 text-primary`}
                  title="Conversar"
                >
                  <MessageCircle className="w-4 h-4" />
                </button>
                <button
                  onClick={() => removeFriend(f.friendshipId)}
                  className={`${btnBase} bg-muted hover:bg-red-500/10 text-muted-foreground hover:text-red-500`}
                  title="Remover amigo"
                >
                  <UserMinus className="w-4 h-4" />
                </button>
              </>
            }
          />
        ))}
      </div>

      {/* Pending sent */}
      {pendingSent.length > 0 && (
        <div className="bg-card rounded-xl p-4 shadow-md">
          <h3 className="font-bold text-sm text-foreground mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            Pedidos enviados ({pendingSent.length})
          </h3>
          {pendingSent.map((f) => (
            <FriendRow
              key={f.friendshipId}
              f={f}
              actions={
                <span className="text-[10px] text-muted-foreground bg-muted px-2 py-1 rounded-full">
                  Aguardando
                </span>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FriendsPanel;
