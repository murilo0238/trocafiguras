import { createClient } from "https://esm.sh/@supabase/supabase-js@2.100.0";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.100.0/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Not authorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Verify the user
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { tradeId } = await req.json();
    if (!tradeId) {
      return new Response(JSON.stringify({ error: "tradeId required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use service role for atomic operations
    const admin = createClient(supabaseUrl, serviceRoleKey);

    // Get trade request
    const { data: trade, error: tradeError } = await admin
      .from("trade_requests")
      .select("*")
      .eq("id", tradeId)
      .single();

    if (tradeError || !trade) {
      return new Response(JSON.stringify({ error: "Trade not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Both participants can trigger execution
    if (![trade.from_user_id, trade.to_user_id].includes(user.id)) {
      return new Response(JSON.stringify({ error: "Not authorized to execute this trade" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (trade.status !== "accepted") {
      return new Response(JSON.stringify({ error: "Trade must be accepted first" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!trade.from_confirmed || !trade.to_confirmed) {
      return new Response(JSON.stringify({ error: "Both parties must confirm before executing" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const fromUser = trade.from_user_id;
    const toUser = trade.to_user_id;
    const offered: string[] = trade.stickers_offered;
    const requested: string[] = trade.stickers_requested;

    // Validate sender owns all offered stickers with duplicates > 0
    if (offered.length > 0) {
      const { data: senderOwned } = await admin
        .from("user_stickers")
        .select("sticker_id")
        .eq("user_id", fromUser)
        .gt("duplicates", 0)
        .in("sticker_id", offered);
      const ownedIds = new Set((senderOwned ?? []).map((s) => s.sticker_id));
      if (offered.some((id) => !ownedIds.has(id))) {
        return new Response(
          JSON.stringify({ error: "Sender does not own all offered stickers" }),
          { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    }

    // Validate recipient owns all requested stickers with duplicates > 0
    if (requested.length > 0) {
      const { data: receiverOwned } = await admin
        .from("user_stickers")
        .select("sticker_id")
        .eq("user_id", toUser)
        .gt("duplicates", 0)
        .in("sticker_id", requested);
      const ownedIds = new Set((receiverOwned ?? []).map((s) => s.sticker_id));
      if (requested.some((id) => !ownedIds.has(id))) {
        return new Response(
          JSON.stringify({ error: "Recipient does not own all requested stickers" }),
          { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    }

    // For each sticker offered by from_user:
    // - Decrease from_user duplicates by 1
    // - Mark as collected for to_user (or add if not exists)
    for (const stickerId of offered) {
      // Decrease sender's duplicates
      const { data: senderSticker } = await admin
        .from("user_stickers")
        .select("duplicates")
        .eq("user_id", fromUser)
        .eq("sticker_id", stickerId)
        .single();

      if (senderSticker) {
        await admin
          .from("user_stickers")
          .update({ duplicates: Math.max(0, senderSticker.duplicates - 1) })
          .eq("user_id", fromUser)
          .eq("sticker_id", stickerId);
      }

      // Mark as collected for receiver
      const { data: receiverSticker } = await admin
        .from("user_stickers")
        .select("collected, duplicates")
        .eq("user_id", toUser)
        .eq("sticker_id", stickerId)
        .single();

      if (receiverSticker) {
        if (receiverSticker.collected) {
          // Already has it, add as duplicate
          await admin
            .from("user_stickers")
            .update({ duplicates: receiverSticker.duplicates + 1 })
            .eq("user_id", toUser)
            .eq("sticker_id", stickerId);
        } else {
          await admin
            .from("user_stickers")
            .update({ collected: true })
            .eq("user_id", toUser)
            .eq("sticker_id", stickerId);
        }
      } else {
        await admin
          .from("user_stickers")
          .insert({ user_id: toUser, sticker_id: stickerId, collected: true, duplicates: 0 });
      }
    }

    // For each sticker requested by from_user (given by to_user):
    for (const stickerId of requested) {
      // Decrease receiver's (to_user) duplicates
      const { data: toSticker } = await admin
        .from("user_stickers")
        .select("duplicates")
        .eq("user_id", toUser)
        .eq("sticker_id", stickerId)
        .single();

      if (toSticker) {
        await admin
          .from("user_stickers")
          .update({ duplicates: Math.max(0, toSticker.duplicates - 1) })
          .eq("user_id", toUser)
          .eq("sticker_id", stickerId);
      }

      // Mark as collected for sender (from_user)
      const { data: fromSticker } = await admin
        .from("user_stickers")
        .select("collected, duplicates")
        .eq("user_id", fromUser)
        .eq("sticker_id", stickerId)
        .single();

      if (fromSticker) {
        if (fromSticker.collected) {
          await admin
            .from("user_stickers")
            .update({ duplicates: fromSticker.duplicates + 1 })
            .eq("user_id", fromUser)
            .eq("sticker_id", stickerId);
        } else {
          await admin
            .from("user_stickers")
            .update({ collected: true })
            .eq("user_id", fromUser)
            .eq("sticker_id", stickerId);
        }
      } else {
        await admin
          .from("user_stickers")
          .insert({ user_id: fromUser, sticker_id: stickerId, collected: true, duplicates: 0 });
      }
    }

    // Mark trade as completed
    await admin
      .from("trade_requests")
      .update({ status: "completed" })
      .eq("id", tradeId);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("execute-trade error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
