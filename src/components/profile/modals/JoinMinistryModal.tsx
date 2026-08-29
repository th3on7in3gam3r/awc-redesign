import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

interface JoinMinistryModalProps {
    isOpen: boolean;
    onClose: () => void;
    preselectedMinistryId?: string;
    ministries: any[]; // List of available ministries { id, name }
    onSuccess: () => void;
}

export const JoinMinistryModal: React.FC<JoinMinistryModalProps> = ({
    isOpen,
    onClose,
    preselectedMinistryId,
    ministries,
    onSuccess
}) => {
    const [selectedMinistryId, setSelectedMinistryId] = useState(preselectedMinistryId || "");
    const [interestRole, setInterestRole] = useState("volunteer");
    const [availability, setAvailability] = useState("Any");
    const [note, setNote] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Reset when opening
    useEffect(() => {
        if (isOpen) {
            setSelectedMinistryId(preselectedMinistryId || "");
            setInterestRole("volunteer");
            setAvailability("Any");
            setNote("");
            setError(null);
        }
    }, [isOpen, preselectedMinistryId]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            const token = localStorage.getItem("token");
            const headers: any = {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            };

            const selectedMinistry = ministries.find(m => m.id === selectedMinistryId);

            const payload = {
                ministry_id: selectedMinistryId || null,
                ministry_name: selectedMinistry ? selectedMinistry.name : "Custom Request",
                interest_role: interestRole,
                availability,
                note
            };

            const res = await fetch("/api/me/ministry-request", {
                method: "POST",
                headers,
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Request failed.");
            }

            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 animate-fade-in">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h4 className="text-lg font-semibold text-slate-900">Request to Join a Ministry</h4>
                        <p className="text-sm text-slate-500">
                            Your request will be sent to leadership for approval.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                        aria-label="Close"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {error && (
                    <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                    {/* Ministry Selection */}
                    <div>
                        <label className="text-sm font-semibold text-slate-700">Ministry</label>
                        <select
                            value={selectedMinistryId}
                            onChange={(e) => setSelectedMinistryId(e.target.value)}
                            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-amber-400"
                            required={ministries.length > 0}
                        >
                            <option value="">Select a ministry...</option>
                            {ministries.map((m) => (
                                <option key={m.id} value={m.id}>
                                    {m.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Role */}
                    <div>
                        <label className="text-sm font-semibold text-slate-700">How would you like to serve?</label>
                        <select
                            value={interestRole}
                            onChange={(e) => setInterestRole(e.target.value)}
                            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-amber-400"
                        >
                            <option value="volunteer">Volunteer (General Help)</option>
                            <option value="helper">Helper (Specific Tasks)</option>
                            <option value="leader">Leader (Coordination)</option>
                        </select>
                    </div>

                    {/* Availability */}
                    <div>
                        <label className="text-sm font-semibold text-slate-700">Availability (Optional)</label>
                        <select
                            value={availability}
                            onChange={(e) => setAvailability(e.target.value)}
                            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-amber-400"
                        >
                            <option value="Any">Any - I'm flexible!</option>
                            <option value="Sundays">Sundays</option>
                            <option value="Wednesdays">Wednesdays</option>
                            <option value="Weekdays">Weekdays</option>
                        </select>
                    </div>

                    {/* Note */}
                    <div>
                        <label className="text-sm font-semibold text-slate-700">Note (Optional)</label>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows={3}
                            placeholder="Tell us about any relevant experience or questions..."
                            className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-amber-400"
                        />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        >
                            Cancel
                        </button>
                        <button
                            disabled={submitting}
                            type="submit"
                            className="rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-60 transition-colors"
                        >
                            {submitting ? "Sending..." : "Send Request"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
