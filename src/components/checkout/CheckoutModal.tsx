import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { X, Loader2, ShieldCheck, Info } from "lucide-react";
import { createOrder, type CreateOrderInput } from "@/lib/checkout.functions";
import { trackEvent } from "@/lib/analytics";
import { Link } from "@tanstack/react-router";
import { PRODUCTS } from "@/lib/products";
import { PaymentMethods } from "@/components/checkout/PaymentMethods";
import {
  PAYMENT_METHODS,
  splitInstallments,
  type PaymentMethodKey,
} from "@/lib/payment-methods";

type Props = {
  open: boolean;
  onClose: () => void;
  items: CreateOrderInput["items"];
  offerKey?: string;
  source?: string;
  title?: string;
};

const fmt = (n: number) => n.toLocaleString("ru-RU").replace(",", " ") + " ₽";

export function CheckoutModal({
  open,
  onClose,
  items,
  offerKey,
  source,
  title = "Оформление заказа",
}: Props) {
  const create = useServerFn(createOrder);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [agree, setAgree] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<null | {
    invoiceId: string;
    amountRub: number;
    paymentMethod: PaymentMethodKey;
  }>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodKey>("card");

  useEffect(() => {
    if (!open) return;
    setError(null);
    setOk(null);
    // Prefill from localStorage lead if available
    try {
      const raw = localStorage.getItem("newface:lead");
      if (raw) {
        const parsed = JSON.parse(raw) as { email?: string; name?: string };
        if (parsed.email) setEmail(parsed.email);
        if (parsed.name) setName(parsed.name);
      }
    } catch {
      /* ignore */
    }
  }, [open]);

  const total = items.reduce(
    (sum, { product, quantity }) => sum + PRODUCTS[product].price * quantity,
    0,
  );

  if (!open) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!agree) {
      setError("Нужно согласие с офертой и политикой");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const sessionId = (() => {
        try {
          let s = localStorage.getItem("newface:sid");
          if (!s) {
            s = Math.random().toString(36).slice(2, 12);
            localStorage.setItem("newface:sid", s);
          }
          return s;
        } catch {
          return undefined;
        }
      })();

      const result = await create({
        data: {
          email: email.trim(),
          name: name.trim() || undefined,
          items,
          offerKey,
          source,
          sessionId,
          paymentMethod,
        },
      });

      try {
        localStorage.setItem(
          "newface:lead",
          JSON.stringify({ email: email.trim(), name: name.trim() }),
        );
      } catch {
        /* ignore */
      }

      trackEvent("checkout:order_created", {
        invoiceId: result.invoiceId,
        amount: result.amountRub,
        offerKey,
        source,
        paymentMethod,
      });

      setOk({
        invoiceId: result.invoiceId,
        amountRub: result.amountRub,
        paymentMethod,
      });

      // TODO: инициализация виджета CloudPayments после подключения ключей:
      // const widget = new (window as any).cp.CloudPayments();
      // widget.charge({
      //   publicId: import.meta.env.VITE_CLOUDPAYMENTS_PUBLIC_ID,
      //   invoiceId: result.invoiceId,
      //   description: items.map(i => i.product).join(", "),
      //   amount: result.amountRub,
      //   currency: "RUB",
      //   email: email.trim(),
      //   data: { items: result.items },
      // }, () => { window.location.href = `/thanks?invoice=${result.invoiceId}`; });
    } catch (err) {
      const raw = err instanceof Error ? err.message : String(err);
      const msg = humanizeError(raw);
      setError(msg);
      trackEvent("checkout:error", { message: raw, offerKey, source });
    } finally {
      setLoading(false);
    }
  }

  function humanizeError(raw: string): string {
    const s = raw.toLowerCase();
    if (s.includes("failed to fetch") || s.includes("networkerror") || s.includes("network"))
      return "Не удалось связаться с сервером. Проверьте интернет и попробуйте ещё раз.";
    if (s.includes("email"))
      return "Похоже, email введён с ошибкой. Проверьте адрес и повторите.";
    if (s.includes("timeout"))
      return "Сервер долго не отвечает. Попробуйте ещё раз через минуту.";
    if (s.includes("permission") || s.includes("forbidden") || s.includes("rls"))
      return "Не удалось создать заказ из-за ограничения доступа. Мы уже знаем — попробуйте позже.";
    if (s.includes("invoice")) return "Не удалось сформировать номер заказа. Попробуйте ещё раз.";
    if (raw.length > 140) return "Что-то пошло не так при создании заказа. Попробуйте ещё раз.";
    return raw;
  }


  const methodInfo = PAYMENT_METHODS[paymentMethod];
  const payButtonAmount =
    methodInfo.installments > 1
      ? splitInstallments(total, methodInfo.installments)[0]
      : total;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-md rounded-3xl bg-background p-7 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Закрыть"
          className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        {ok ? (
          (() => {
            const info = PAYMENT_METHODS[ok.paymentMethod];
            const parts =
              info.installments > 1
                ? splitInstallments(ok.amountRub, info.installments)
                : null;
            return (
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <ShieldCheck className="h-7 w-7" strokeWidth={1.5} />
                </div>
                <h3 className="mt-5 font-serif text-2xl leading-tight">
                  Заказ №{ok.invoiceId.split("-").slice(-1)[0]} создан
                </h3>
                <p className="mt-3 text-sm text-muted-foreground">
                  К оплате: <b className="text-foreground">{fmt(ok.amountRub)}</b>
                </p>
                <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-3 py-1.5 text-xs">
                  <span className="text-muted-foreground">Способ оплаты:</span>
                  <b className="text-foreground">{info.label}</b>
                </div>
                {parts && (
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    {info.installments} × {fmt(parts[0])} — раз в 2 недели, без переплаты.
                  </p>
                )}
                <div className="mt-6 flex items-start gap-2 rounded-2xl bg-secondary/70 p-4 text-left text-xs text-muted-foreground">
                  <Info className="mt-0.5 h-4 w-4 flex-none text-primary" />
                  <span>
                    Приём онлайн-оплат подключаем в ближайшие дни. Мы напишем вам на{" "}
                    <b className="text-foreground">{email}</b>, когда сможем принять
                    платёж по этому заказу — цена, скидка и выбранный способ сохранятся.
                  </span>
                </div>
                <div className="mt-6 flex flex-col gap-2">
                  <Link
                    to="/payment-success"
                    search={{ invoice: ok.invoiceId }}
                    className="w-full rounded-2xl bg-primary py-3.5 text-center text-sm font-medium text-primary-foreground hover:brightness-105"
                  >
                    Посмотреть статус заказа
                  </Link>
                  <button
                    onClick={onClose}
                    className="w-full rounded-2xl border border-border py-3 text-sm font-medium hover:border-primary hover:text-primary"
                  >
                    Закрыть
                  </button>
                </div>
              </div>
            );
          })()
        ) : (
          <>
            <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
              {title}
            </div>
            <div className="mt-2 font-serif text-2xl leading-tight">
              Ссылка на оплату — {fmt(total)}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Оставьте email — пришлём защищённую ссылку на оплату в течение нескольких минут вручную.
              Цена и выбранный способ сохранятся.
            </p>


            <form onSubmit={submit} className="mt-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Email для доступа и чека
                </label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-1.5 w-full rounded-2xl border border-border bg-card px-4 py-3 text-[15px] outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Как к вам обращаться
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Имя"
                  className="mt-1.5 w-full rounded-2xl border border-border bg-card px-4 py-3 text-[15px] outline-none focus:border-primary"
                />
              </div>

              <label className="flex items-start gap-2.5 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-primary"
                />
                <span>
                  Я принимаю{" "}
                  <Link
                    to="/offer"
                    target="_blank"
                    className="text-primary underline"
                  >
                    оферту
                  </Link>{" "}
                  и{" "}
                  <Link
                    to="/privacy"
                    target="_blank"
                    className="text-primary underline"
                  >
                    политику конфиденциальности
                  </Link>
                  .
                </span>
              </label>

              {/* Installment options temporarily disabled */}

              {error && (
                <div className="rounded-xl bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-[15px] font-medium text-primary-foreground transition hover:brightness-105 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Отправляем…
                  </>
                ) : (
                  <>Получить ссылку на оплату</>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
                <ShieldCheck className="h-3 w-3" strokeWidth={2} />
                Данные защищены · чек по 54-ФЗ · оплата картой РФ/СНГ
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

