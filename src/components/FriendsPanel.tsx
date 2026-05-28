import { useState } from "react";
import { Link } from "react-router-dom";
import { Users, Check, X, MessageCircle, UserMinus, Clock, Search, UserPlus, BookOpen } from "lucide-react";
import { useFriends, Friend, UserSearchResult } from "@/contexts/FriendsContext";
import UserAvatar from "@/components/UserAvatar";
import DirectChatPanel from "@/components/DirectChatPanel";

const FriendsPanel = () => {
  const { accepted, pendingReceived, pendingSent, loading, acceptRequest, rejectRequest, removeFriend, sendRequest, searchUsers, reload } = useFriends();
  const [chat, setChat] = useState<{ userId: string; name: string; avatarUrl: string | null } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);

  const handleSearch = async () => {
    if (searchTerm.trim().length < 2) return;
    setSearching(true);
    const results = await searchUsers(searchTerm);
    setSearchResults(results);
    setSearching(false);
  };

  const handleAdd = async (result: UserSearchResult) => {
    setAddingId(result.userId);
    await sendRequest(result.userId, result.displayName);
    setSearchResults((prev) => prev.filter((r) => r.userId !== result.userId));
    await reload();
    setAddingId(null);
  };

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
      {/* Busca por nome de usuário */}
      <div className="bg-card rounded-xl p-4 shadow-md">
        <h3 className="font-bold text-sm text-foreground mb-3 flex items-center gap-2">
          <Search className="w-4 h-4 text-primary" />
          Buscar amigo por nome
        </h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Digite o nome de usuário..."
            className="flex-1 px-3 py-2 text-sm rounded-lg bg-muted text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={handleSearch}
            disabled={searching || searchTerm.trim().length < 2}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {searching ? "..." : "Buscar"}
          </button>
        </div>
        {searchResults.length > 0 && (
          <div className="mt-3 space-y-1">
            {searchResults.map((r) => (
              <div key={r.userId} className="flex items-center gap-3 py-2 border-b border-border/40 last:border-0">
                <div className="w-9 h-9 rounded-full overflow-hidden bg-muted flex-shrink-0">
                  <UserAvatar avatarUrl={r.avatarUrl} displayName={r.displayName} className="w-full h-full" />
                </div>
                <span className="flex-1 text-sm font-medium text-foreground truncate">{r.displayName}</span>
                <Link
                  to={`/album/${r.userId}`}
                  className="p-2 rounded-lg bg-muted hover:bg-primary/10 text-primary transition-colors"
                  title="Ver álbum"
                >
                  <BookOpen className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => handleAdd(r)}
                  disabled={addingId === r.userId}
                  className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors disabled:opacity-50"
                  title="Adicionar amigo"
                >
                  <UserPlus className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        {searchResults.length === 0 && searchTerm.length >= 2 && !searching && (
          <p className="text-xs text-muted-foreground mt-2">Nenhum usuário encontrado. Tente outro nome.</p>
        )}
      </div>

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
                <Link
                  to={`/album/${f.userId}`}
                  className={`${btnBase} bg-muted hover:bg-primary/10 text-primary`}
                  title="Ver álbum"
                >
                  <BookOpen className="w-4 h-4" />
                </Link>
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
