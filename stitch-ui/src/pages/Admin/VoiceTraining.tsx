import { useEffect, useState, useRef } from "react";
import { Mic, Plus, Trash2, Search, AlertTriangle, CheckCircle, RefreshCw, Copy, Check } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { setCustomVoiceRules, type VoiceTrainingRule } from "../../services/voiceAssistantService";

export default function VoiceTraining() {
  const [rules, setRules] = useState<VoiceTrainingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableExists, setTableExists] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);

  // Form state
  const [spokenTerm, setSpokenTerm] = useState("");
  const [actualTerm, setActualTerm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const lastSubmitRef = useRef<number>(0);

  const sqlMigrationCode = `-- Copy and run this in Supabase SQL Editor:
create table if not exists public.voice_training_rules (
  id uuid primary key default gen_random_uuid(),
  spoken_term text not null unique,
  actual_term text not null,
  created_at timestamptz not null default now()
);

alter table public.voice_training_rules enable row level security;

create policy "Allow public read-only access to voice training rules"
on public.voice_training_rules for select
using (true);

create policy "Allow authenticated admin full access to voice training rules"
on public.voice_training_rules for all
using (
  exists (
    select 1 from public.users
    where users.id = auth.uid()
    and users.role = 'admin'
  )
)
with check (
  exists (
    select 1 from public.users
    where users.id = auth.uid()
    and users.role = 'admin'
  )
);`;

  const fetchRules = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("voice_training_rules")
        .select("id, spoken_term, actual_term, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        if (error.code === "42P01" || error.message.includes("relation") || error.message.includes("does not exist")) {
          setTableExists(false);
        } else {
          console.error("Error fetching voice rules:", error.message);
        }
        setRules([]);
      } else {
        setTableExists(true);
        const list = (data || []) as VoiceTrainingRule[];
        setRules(list);
        setCustomVoiceRules(list);
      }
    } catch {
      setTableExists(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleAddRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!spokenTerm.trim() || !actualTerm.trim()) {
      setStatusMessage({ type: "error", text: "Please provide both spoken term and target catalog term." });
      return;
    }

    // PROD-03: Rate limiting / submit locking guard (2000ms debounce)
    const now = Date.now();
    if (submitting || now - lastSubmitRef.current < 2000) {
      return;
    }
    lastSubmitRef.current = now;

    // Short-circuit if database table does not exist in production
    if (!tableExists) {
      setStatusMessage({ type: "error", text: "Database table not found. Voice training rule creation is unavailable." });
      return;
    }

    setSubmitting(true);
    setStatusMessage(null);

    const newRule = {
      spoken_term: spokenTerm.trim().toLowerCase(),
      actual_term: actualTerm.trim().toLowerCase(),
    };

    const { error } = await supabase.from("voice_training_rules").insert(newRule);

    if (error) {
      if (error.code === "23505") {
        setStatusMessage({ type: "error", text: `Rule for "${spokenTerm}" already exists.` });
      } else if (error.code === "42P01") {
        setTableExists(false);
        setStatusMessage({ type: "error", text: "Database table not found. Please run the SQL migration." });
      } else {
        setStatusMessage({ type: "error", text: error.message });
      }
    } else {
      setStatusMessage({ type: "success", text: `Successfully added rule: "${spokenTerm}" -> "${actualTerm}"` });
      setSpokenTerm("");
      setActualTerm("");
      await fetchRules();
    }
    setSubmitting(false);
  };

  const handleDeleteRule = async (id?: string, term?: string) => {
    if (!id) return;
    if (!confirm(`Are you sure you want to delete the voice training rule for "${term}"?`)) return;

    const { error } = await supabase.from("voice_training_rules").delete().eq("id", id);
    if (error) {
      alert(`Failed to delete rule: ${error.message}`);
    } else {
      await fetchRules();
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlMigrationCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredRules = rules.filter(
    (r) =>
      r.spoken_term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.actual_term.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-xl border border-primary/15 bg-gradient-to-r from-primary/10 via-ivory to-accent/10 p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-accent/15 p-2.5 text-accent">
            <Mic className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-primary">Voice Vocabulary & Alias Dictionary</h2>
            <p className="text-xs text-primary/70 mt-0.5">
              Manage regional dialect aliases, phonetic transliterations, and speech-to-text vocabulary mappings (e.g. "siram" → "serum", "nautanki" → "dot key").
            </p>
          </div>
        </div>
      </div>

      {/* SQL Migration Setup Warning if Table Missing */}
      {!tableExists && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-5 space-y-3 text-amber-950">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-amber-900">Database Table Required</h3>
              <p className="text-xs text-amber-800/90 mt-1">
                The <code className="bg-amber-200/50 px-1 py-0.5 rounded">voice_training_rules</code> table was not detected in Supabase. Please copy the SQL snippet below and execute it inside your <strong>Supabase SQL Editor</strong> to enable database training persistence.
              </p>
            </div>
          </div>
          <div className="relative rounded-lg bg-emerald-950 p-4 text-emerald-300 font-mono text-xs overflow-x-auto">
            <button
              onClick={handleCopySql}
              className="absolute top-3 right-3 flex items-center gap-1.5 rounded-md bg-emerald-800/80 px-2.5 py-1 text-[11px] text-white hover:bg-emerald-700 transition"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? "Copied!" : "Copy SQL"}</span>
            </button>
            <pre className="whitespace-pre">{sqlMigrationCode}</pre>
          </div>
        </div>
      )}

      {/* Add New Training Rule Form */}
      <div className="rounded-xl border border-primary/15 bg-ivory p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-primary">Add Voice Training Rule</h3>
        <form onSubmit={handleAddRule} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-medium text-primary/80">
              Spoken / Garbled Term <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. siram, nautanki, choodi"
              value={spokenTerm}
              onChange={(e) => setSpokenTerm(e.target.value)}
              className="w-full rounded-lg border border-primary/20 bg-white px-3.5 py-2 text-sm text-primary placeholder:text-primary/40 focus:border-accent focus:outline-none"
              required
            />
            <p className="text-[11px] text-primary/50">What speech-to-text outputs when user speaks</p>
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-medium text-primary/80">
              Target Catalog Term <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. serum, dot key, bangles"
              value={actualTerm}
              onChange={(e) => setActualTerm(e.target.value)}
              className="w-full rounded-lg border border-primary/20 bg-white px-3.5 py-2 text-sm text-primary placeholder:text-primary/40 focus:border-accent focus:outline-none"
              required
            />
            <p className="text-[11px] text-primary/50">Actual product or brand keyword in catalog</p>
          </div>

          <div>
            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-ivory hover:bg-accent/90 disabled:opacity-50 transition shadow-sm"
            >
              {submitting ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>Add Rule</span>
                </>
              )}
            </button>
          </div>
        </form>

        {statusMessage && (
          <div
            className={`flex items-center gap-2 rounded-lg p-3 text-xs ${
              statusMessage.type === "success" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-rose-50 text-rose-800 border border-rose-200"
            }`}
          >
            {statusMessage.type === "success" ? <CheckCircle className="h-4 w-4 shrink-0" /> : <AlertTriangle className="h-4 w-4 shrink-0" />}
            <span>{statusMessage.text}</span>
          </div>
        )}
      </div>

      {/* Rules Table */}
      <div className="rounded-xl border border-primary/15 bg-ivory p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-primary">Active Voice Training Rules</h3>
            <p className="text-xs text-primary/60">Total active rules: {rules.length}</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-primary/40" />
            <input
              type="text"
              placeholder="Search rules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 rounded-lg border border-primary/20 bg-white pl-9 pr-3.5 py-1.5 text-xs text-primary placeholder:text-primary/40 focus:border-accent focus:outline-none"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-primary/60">Loading voice training rules...</div>
        ) : filteredRules.length === 0 ? (
          <div className="py-8 text-center text-xs text-primary/60">
            {searchQuery ? "No matching rules found." : "No voice training rules added yet. Add one above!"}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-primary/15">
            <table className="w-full text-left text-xs text-primary">
              <thead className="bg-primary/5 uppercase tracking-wider text-[11px] text-primary/70">
                <tr>
                  <th className="px-4 py-3 font-semibold">Spoken Term</th>
                  <th className="px-4 py-3 font-semibold">Mapped Catalog Term</th>
                  <th className="px-4 py-3 font-semibold">Created Date</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/10 bg-white">
                {filteredRules.map((rule) => (
                  <tr key={rule.id || rule.spoken_term} className="hover:bg-primary/5 transition">
                    <td className="px-4 py-3 font-mono font-medium text-accent">{rule.spoken_term}</td>
                    <td className="px-4 py-3 font-semibold text-primary">{rule.actual_term}</td>
                    <td className="px-4 py-3 text-primary/50 text-[11px]">
                      {rule.created_at ? new Date(rule.created_at).toLocaleDateString() : "Just now"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDeleteRule(rule.id, rule.spoken_term)}
                        className="rounded p-1.5 text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition"
                        title="Delete rule"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
