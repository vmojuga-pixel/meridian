INSERT OR IGNORE INTO public_kb (id, topic, question, answer, tags, priority) VALUES
('kb_overview', 'overview', 'What is Meridian?',
'Meridian is an enterprise AI operations platform for industrial environments. We enable factories to modernise their existing production systems with intelligent automation — without replacing equipment that is already performing well.',
'overview,intro', 100),

('kb_value', 'value', 'What problem does Meridian solve?',
'Most factories cannot afford to replace their production lines. Meridian gives them a modern operational intelligence layer on top of their existing infrastructure. They gain automation, energy optimisation, and predictive insight — at a fraction of replacement cost.',
'value,roi', 95),

('kb_philosophy', 'philosophy', 'What is Meridian''s core philosophy?',
'Rules control. AI advises. Humans decide. Every automated action is governed by deterministic rules, reviewed by your engineers, and reversible at any time. Nothing safety-critical runs on opaque intelligence.',
'philosophy,safety', 90),

('kb_ai', 'ai', 'How does the AI work?',
'Meridian combines a deterministic rules engine for operational control with an AI advisor for analysis and recommendations. The advisor never issues commands. It summarises performance, surfaces anomalies, and suggests improvements for human review.',
'ai,advisory', 90),

('kb_compliance', 'compliance', 'Is Meridian compliant with European regulation?',
'Yes. Meridian is designed for compliance with the EU AI Act, GDPR, and IEC 62443 from the ground up. We maintain immutable audit trails, human oversight on all decisions, transparency in every action, and full data governance. Compliance is a design principle, not an afterthought.',
'compliance,eu,gdpr', 90),

('kb_data', 'data', 'Where does my data go?',
'Your operational data stays on your premises by default. Only summaries and events that you explicitly enable are synchronised. You retain full ownership and control at all times.',
'data,privacy,sovereignty', 95),

('kb_deploy', 'deployment', 'How long does deployment take?',
'A typical pilot runs 30 days. The first three weeks are read-only observation, so we learn your environment without any intervention. The final week activates closed-loop automation — only after your engineers sign off on every rule.',
'deployment,pilot', 85),

('kb_pricing', 'pricing', 'What does Meridian cost?',
'Four plans: Free (up to 3 machines), Starter (€49/month, up to 25 machines), Growth (€199/month, up to 200 machines), and Enterprise (custom, unlimited). One-time deployment ranges €5,000–€15,000 per site. No lock-in, cancel any time, your data is always exportable.',
'pricing,plans', 90),

('kb_integration', 'integration', 'Will Meridian work with my existing systems?',
'Yes. Meridian integrates with the industrial protocols and controllers in common use across European manufacturing. There is no replacement of existing infrastructure — we work alongside it.',
'integration,legacy', 85),

('kb_sectors', 'sectors', 'Which industries does Meridian serve?',
'Manufacturing, food processing, chemicals, automotive supply, metalworking, textiles, energy, and logistics. Any operation with industrial equipment that needs modernisation without full replacement.',
'sectors,industries', 80),

('kb_safety', 'safety', 'Is this safe?',
'Yes. Meridian operates on strict principles: deterministic control, human oversight, kill switch at all times, and every action logged with a reason. We do not allow autonomous AI to make safety-critical decisions.',
'safety,control', 95),

('kb_scale', 'scale', 'Can Meridian support multiple sites?',
'Yes. Meridian is designed for multi-site operations from the beginning. Each facility operates independently, while management can access consolidated intelligence across sites.',
'scale,multi-site', 75);
