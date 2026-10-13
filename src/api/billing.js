import { logAuth } from "../auth/audit.js";

function ip(request) { return request.headers.get("CF-Connecting-IP") || "unknown"; }
function ua(request) { return request.headers.get("User-Agent") || "unknown"; }

export async function handlePlans(request, env, session) {
  const rows = await env.DB.prepare("SELECT id, name, price_monthly, max_machines, max_users, features FROM plans ORDER BY price_monthly").all();
  return Response.json({ plans: rows.results || [] });
}

export async function handleCurrentPlan(request, env, session) {
  const t = await env.DB.prepare(
    "SELECT plan_id, trial_ends_at, stripe_customer_id, stripe_subscription_id FROM tenants WHERE id = ?"
  ).bind(session.tenantId).first();
  const planId = (t && t.plan_id) || "free";
  const plan = await env.DB.prepare("SELECT * FROM plans WHERE id = ?").bind(planId).first();

  const [machineCount, userCount] = await Promise.all([
    env.DB.prepare("SELECT COUNT(*) as n FROM machines WHERE tenant_id = ?").bind(session.tenantId).first(),
    env.DB.prepare("SELECT COUNT(*) as n FROM users WHERE tenant_id = ?").bind(session.tenantId).first(),
  ]);

  return Response.json({
    plan,
    usage: {
      machines: machineCount?.n ?? 0,
      users: userCount?.n ?? 0,
    },
    trial_ends_at: t ? t.trial_ends_at : null,
    has_stripe: !!(t && t.stripe_customer_id),
  });
}

export async function handleSelectPlan(request, env, session) {
  if (session.role !== "owner") return Response.json({ error: "Owner only" }, { status: 403 });
  const { plan_id } = await request.json();
  const plan = await env.DB.prepare("SELECT * FROM plans WHERE id = ?").bind(plan_id).first();
  if (!plan) return Response.json({ error: "Invalid plan" }, { status: 400 });

  await env.DB.prepare("UPDATE tenants SET plan_id = ? WHERE id = ?").bind(plan_id, session.tenantId).run();
  await logAuth(env, "plan_changed", {
    userId: session.userId, tenantId: session.tenantId,
    ip: ip(request), ua: ua(request), meta: { plan_id },
  });
  return Response.json({ ok: true, plan });
}

export async function checkPlanLimit(env, tenantId, resource) {
  const t = await env.DB.prepare("SELECT plan_id FROM tenants WHERE id = ?").bind(tenantId).first();
  const planId = (t && t.plan_id) || "free";
  const plan = await env.DB.prepare("SELECT * FROM plans WHERE id = ?").bind(planId).first();
  if (!plan) return { ok: true };

  if (resource === "machine") {
    const c = await env.DB.prepare("SELECT COUNT(*) as n FROM machines WHERE tenant_id = ?").bind(tenantId).first();
    if ((c?.n ?? 0) >= plan.max_machines) {
      return { ok: false, error: "Plan limit reached: " + plan.max_machines + " machines", plan: planId };
    }
  }
  if (resource === "user") {
    const c = await env.DB.prepare("SELECT COUNT(*) as n FROM users WHERE tenant_id = ?").bind(tenantId).first();
    if ((c?.n ?? 0) >= plan.max_users) {
      return { ok: false, error: "Plan limit reached: " + plan.max_users + " users", plan: planId };
    }
  }
  return { ok: true };
}

export async function handleStripeCheckout(request, env, session) {
  if (session.role !== "owner") return Response.json({ error: "Owner only" }, { status: 403 });
  const { plan_id } = await request.json();
  const plan = await env.DB.prepare("SELECT * FROM plans WHERE id = ?").bind(plan_id).first();
  if (!plan) return Response.json({ error: "Invalid plan" }, { status: 400 });

  const stripeKey = env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return Response.json({
      ok: true,
      mock: true,
      message: "Stripe not configured. Plan selected in mock mode.",
      plan_id,
    });
  }

  const origin = new URL(request.url).origin;
  const params = new URLSearchParams();
  params.append("mode", "subscription");
  params.append("success_url", origin + "/dashboard?billing=success");
  params.append("cancel_url", origin + "/dashboard?billing=cancel");
  params.append("client_reference_id", session.tenantId);
  params.append("customer_email", session.email);
  params.append("metadata[tenant_id]", session.tenantId);
  params.append("metadata[plan_id]", plan_id);

  const priceMap = env.STRIPE_PRICE_MAP ? JSON.parse(env.STRIPE_PRICE_MAP) : {};
  if (!priceMap[plan_id]) {
    return Response.json({ error: "No Stripe price configured for " + plan_id }, { status: 400 });
  }
  params.append("line_items[0][price]", priceMap[plan_id]);
  params.append("line_items[0][quantity]", "1");

  const r = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + stripeKey,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });
  const j = await r.json();
  if (!r.ok) return Response.json({ error: "Stripe error", detail: j }, { status: 500 });

  await logAuth(env, "stripe_checkout_started", {
    userId: session.userId, tenantId: session.tenantId,
    ip: ip(request), ua: ua(request), meta: { plan_id, session_id: j.id },
  });

  return Response.json({ ok: true, url: j.url, session_id: j.id });
}

export async function handleStripeWebhook(request, env) {
  const sig = request.headers.get("Stripe-Signature");
  const body = await request.text();
  if (!sig) return Response.json({ error: "No signature" }, { status: 400 });

  let event;
  try { event = JSON.parse(body); } catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }

  if (event.type === "checkout.session.completed") {
    const s = event.data.object;
    const tenantId = s.metadata && s.metadata.tenant_id;
    const planId = s.metadata && s.metadata.plan_id;
    if (tenantId && planId) {
      await env.DB.prepare(
        "UPDATE tenants SET plan_id = ?, stripe_customer_id = ?, stripe_subscription_id = ? WHERE id = ?"
      ).bind(planId, s.customer || null, s.subscription || null, tenantId).run();
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const s = event.data.object;
    await env.DB.prepare(
      "UPDATE tenants SET plan_id = 'free', stripe_subscription_id = NULL WHERE stripe_customer_id = ?"
    ).bind(s.customer).run();
  }

  return Response.json({ received: true });
}
