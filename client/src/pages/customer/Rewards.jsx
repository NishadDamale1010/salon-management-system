import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useState } from "react";
import { Sparkles, Gift, ArrowRight } from "lucide-react";
import { rewardService } from "../../services";
import { QUERY_KEYS } from "../../constants/queryKeys";
import { useAuthStore } from "../../store/authStore";
import { toast } from "sonner";
import { Badge } from "../../components/ui/Badge";
import { SkeletonCard } from "../../components/ui/Skeleton";

export default function Rewards() {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const { data, isLoading } = useQuery({ queryKey: QUERY_KEYS.REWARDS, queryFn: rewardService.getAll });
  const rewards = data?.data || [];

  const { mutate: redeem, isPending } = useMutation({
    mutationFn: rewardService.redeem,
    onSuccess: () => { toast.success("Reward redeemed! 🎁"); qc.invalidateQueries({ queryKey: QUERY_KEYS.MY_REDEMPTIONS }); },
    onError: (err) => toast.error(err.message),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-[var(--color-text-primary)]">Rewards</h1>
        <p className="text-[var(--color-text-muted)] text-sm mt-1">Redeem your Glow Points for exclusive rewards</p>
      </div>

      {/* Points Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[var(--color-rose-900)]/50 to-purple-900/30 border border-[var(--color-rose-500)]/20 p-4 sm:p-5 flex items-center justify-between">
        <div>
          <p className="text-sm text-[var(--color-text-muted)]">Your Glow Points</p>
          <p className="font-display text-3xl sm:text-4xl font-bold text-gradient-rose">{user?.glowPoints || 0}</p>
        </div>
        <Sparkles className="w-12 h-12 text-[var(--color-rose-500)]/30" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {isLoading ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />) :
          rewards.map((reward, i) => {
            const canRedeem = (user?.glowPoints || 0) >= reward.glowPointsRequired && reward.isActive;
            return (
              <motion.div key={reward._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className={`rounded-2xl bg-[var(--color-surface-card)] border p-5 flex flex-col transition-all ${canRedeem ? "border-[var(--color-rose-500)]/30 hover:shadow-[var(--shadow-card-hover)]" : "border-[var(--color-border)] opacity-60"}`}
              >
                {reward.image && <img src={reward.image} alt={reward.title} className="w-full h-36 object-cover rounded-xl mb-4" />}
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mb-3">
                  <Gift className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="font-display font-semibold text-[var(--color-text-primary)] text-lg">{reward.title}</h3>
                <p className="text-sm text-[var(--color-text-muted)] mt-1 flex-1">{reward.description}</p>
                <div className="flex items-center justify-between mt-4 mb-3">
                  <div className="flex items-center gap-1 text-yellow-400 font-bold">
                    <Sparkles className="w-4 h-4" />{reward.glowPointsRequired} pts
                  </div>
                  <Badge variant="ghost">Save ₹{reward.discountAmount}</Badge>
                </div>
                <button
                  onClick={() => redeem(reward._id)}
                  disabled={!canRedeem || isPending}
                  className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all ${canRedeem ? "-white hover:shadow-[var(--shadow-glow-rose)]" : "bg-[var(--color-surface-3)] text-[var(--color-text-muted)] cursor-not-allowed"}`}
                >
                  {!reward.isActive ? "Unavailable" : !canRedeem ? `Need ${reward.glowPointsRequired - (user?.glowPoints || 0)} more pts` : "Redeem Now"}
                </button>
              </motion.div>
            );
          })}
      </div>
    </div>
  );
}
