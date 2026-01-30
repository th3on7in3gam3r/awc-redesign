import React, { useEffect, useMemo, useState } from "react";
import { Users, Plus, CheckCircle2, Clock } from "lucide-react";
import { JoinMinistryModal } from "./modals/JoinMinistryModal";

const DEFAULT_SUGGESTED = [
    { name: "Men’s Ministry", description: "Brotherhood, growth, accountability." },
    { name: "Women’s Ministry", description: "Encouragement, fellowship, prayer." },
    { name: "Youth Ministry", description: "Mentoring and youth discipleship." },
    { name: "Children’s Ministry", description: "Serve families and kids." },
    { name: "Worship Team", description: "Vocals, instruments, praise & worship." },
    { name: "Media Team", description: "Sound, slides, livestream, photography." },
];

export default function MinistriesCard() {
    const [myMinistries, setMyMinistries] = useState<any[]>([]);
    const [allMinistries, setAllMinistries] = useState<any[]>([]);
    const [pendingRequests, setPendingRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [preselectedMinistryId, setPreselectedMinistryId] = useState("");

    // Refresh function to reload data after a successful request
    const fetchData = async () => {
        try {
            const token = localStorage.getItem("token");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            const [mineRes, allRes, reqRes] = await Promise.all([
                fetch("/api/me/ministries", { headers }),
                fetch("/api/ministries", { headers }),
                fetch("/api/me/ministry-requests", { headers })
            ]);

            const mine = mineRes.ok ? await mineRes.json() : [];
            const all = allRes.ok ? await allRes.json() : [];
            const reqs = reqRes.ok ? await reqRes.json() : [];

            setMyMinistries(Array.isArray(mine) ? mine : []);
            setAllMinistries(Array.isArray(all) ? all : []);
            setPendingRequests(Array.isArray(reqs) ? reqs : []);
        } catch (error) {
            console.error("Error fetching ministry data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Suggested ministries = ones user is not in yet
    const suggested = useMemo(() => {
        const myNames = new Set(myMinistries.map((m) => (m.name || "").toLowerCase()));
        const fromDb = allMinistries
            .filter((m) => !myNames.has((m.name || "").toLowerCase()))
            .slice(0, 6)
            .map((m) => ({
                id: m.id,
                name: m.name,
                description: m.description || "Get involved and serve.",
                source: "db",
            }));

        // If DB has none, fall back to defaults
        if (fromDb.length > 0) return fromDb;

        return DEFAULT_SUGGESTED
            .filter((m) => !myNames.has(m.name.toLowerCase()))
            .map((m) => ({ ...m, id: "", source: "default" }))
            .slice(0, 6);
    }, [allMinistries, myMinistries]);

    function openModal(ministryId = "") {
        setPreselectedMinistryId(ministryId);
        setIsModalOpen(true);
    }

    // Helper to check if a ministry has a pending request
    const getPendingStatus = (ministryId: string, ministryName: string) => {
        if (!ministryId && !ministryName) return null;
        return pendingRequests.find(r =>
            (r.ministry_id === ministryId) ||
            (r.ministry_name === ministryName)
        );
    };

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-700">
                        <Users className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-slate-900">My Ministries</h3>
                        <p className="text-sm text-slate-500">
                            Your serving teams and ways to get involved.
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => openModal()}
                    className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-3 py-2 text-sm font-semibold text-white hover:bg-amber-700"
                >
                    <Plus className="h-4 w-4" /> Join a Ministry
                </button>
            </div>

            <div className="mt-5">
                {loading ? (
                    <div className="space-y-3">
                        <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
                        <div className="h-20 animate-pulse rounded-xl bg-slate-100" />
                    </div>
                ) : myMinistries.length > 0 ? (
                    <ul className="space-y-3">
                        {myMinistries.map((m) => (
                            <li
                                key={m.id || `${m.name}-${m.role}`}
                                className="flex items-start justify-between rounded-xl border border-slate-200 p-4"
                            >
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                        <p className="truncate font-semibold text-slate-900">{m.name}</p>
                                    </div>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Role: <span className="font-medium text-slate-700">{m.role || "volunteer"}</span>
                                    </p>
                                </div>

                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                                    Active
                                </span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <>
                        <p className="text-sm text-slate-600">
                            Not part of a team yet? Here are a few ways to serve:
                        </p>

                        <div className="mt-4 grid gap-3 md:grid-cols-2">
                            {suggested.map((m, idx) => {
                                const pending = getPendingStatus(m.id, m.name);
                                return (
                                    <div
                                        key={m.id || `${m.name}-${idx}`}
                                        className={`relative group rounded-xl border p-4 text-left transition-all ${pending
                                                ? 'border-slate-200 bg-slate-50'
                                                : 'border-slate-200 hover:border-amber-300 hover:bg-amber-50/40'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <p className="font-semibold text-slate-900 group-hover:text-amber-800">
                                                {m.name}
                                            </p>
                                            {pending && (
                                                <span className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600 shadow-sm">
                                                    <Clock className="h-3 w-3" /> Pending
                                                </span>
                                            )}
                                        </div>
                                        <p className="mt-1 text-sm text-slate-500 mb-3">{m.description}</p>

                                        {!pending ? (
                                            <button
                                                onClick={() => openModal(m.id)}
                                                className="text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 px-3 py-1.5 rounded-lg transition-colors"
                                            >
                                                Request to join
                                            </button>
                                        ) : (
                                            <span className="text-xs font-medium text-slate-400 cursor-not-allowed">
                                                Request sent
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>

            <JoinMinistryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                preselectedMinistryId={preselectedMinistryId}
                ministries={allMinistries}
                onSuccess={fetchData}
            />
        </div>
    );
}
