import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getMyProfile, updateMyProfile } from "@/lib/account.functions";

export const Route = createFileRoute("/_authenticated/account/")({
  component: ProfilePage,
});

function ProfilePage() {
  const fetchProfile = useServerFn(getMyProfile);
  const saveProfile = useServerFn(updateMyProfile);
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["my-profile"],
    queryFn: () => fetchProfile(),
  });

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (data) {
      setFullName(data.full_name ?? "");
      setPhone(data.phone ?? "");
    }
  }, [data]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await saveProfile({ data: { full_name: fullName || null, phone: phone || null } });
      setSaved(true);
      await refetch();
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) return <p className="text-sm text-muted-foreground">Загрузка…</p>;

  return (
    <form onSubmit={onSubmit} className="max-w-lg space-y-4">
      <div>
        <label className="block text-xs text-muted-foreground mb-1">Email</label>
        <input
          disabled
          value={data?.email ?? ""}
          className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-2.5 text-sm text-muted-foreground"
        />
      </div>
      <div>
        <label className="block text-xs text-muted-foreground mb-1">Имя</label>
        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm"
          placeholder="Как к вам обращаться"
        />
      </div>
      <div>
        <label className="block text-xs text-muted-foreground mb-1">Телефон</label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm"
          placeholder="+7 …"
        />
      </div>
      <button
        type="submit"
        disabled={saving}
        className="rounded-2xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60"
      >
        {saving ? "Сохраняю…" : "Сохранить"}
      </button>
      {saved && <span className="ml-3 text-xs text-primary">Сохранено ✓</span>}
    </form>
  );
}
