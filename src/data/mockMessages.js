export const mockMessages = [
  {
    id: 1,
    role: 'assistant',
    content: 'Hello! I\'m your RAG-powered assistant trained on the CIS Controls v8 document. Ask me anything about cybersecurity controls, safeguards, or best practices.',
    timestamp: '09:00 AM',
    sources: [],
  },
  {
    id: 2,
    role: 'user',
    content: 'What is CIS Critical Security Control 1?',
    timestamp: '09:01 AM',
  },
  {
    id: 3,
    role: 'assistant',
    content: 'CIS Control 1 is "Inventory and Control of Enterprise Assets." It requires organizations to actively manage all enterprise assets — including end-user devices, network devices, IoT devices, and servers — connected to the infrastructure. The goal is to accurately know every asset that needs to be monitored and protected.\n\nKey safeguards include:\n• Maintaining an up-to-date asset inventory (reviewed bi-annually)\n• Addressing unauthorized assets within a week\n• Using active discovery tools to identify assets on the network\n• Using DHCP logging to keep the inventory current',
    timestamp: '09:01 AM',
    sources: ['CIS Controls v8 · Control 1 · Pages 17–19'],
  },
  {
    id: 4,
    role: 'user',
    content: 'How should audit logs be retained according to CIS?',
    timestamp: '09:03 AM',
  },
  {
    id: 5,
    role: 'assistant',
    content: 'According to CIS Control 8 (Audit Log Management), organizations must retain audit logs across enterprise assets for a minimum of 90 days. This enables the ability to detect, understand, and recover from attacks even when the incident is discovered weeks later.\n\nAdditional requirements include:\n• Collecting detailed logs (event source, date, username, timestamp, source/destination addresses)\n• Centralizing log collection (safeguard 8.9)\n• Conducting weekly log reviews to detect anomalies (safeguard 8.11)\n• Synchronizing time across systems with at least two sources (safeguard 8.4)',
    timestamp: '09:03 AM',
    sources: ['CIS Controls v8 · Control 8 · Pages 36–37'],
  },
  {
    id: 6,
    role: 'user',
    content: 'What are the penetration testing requirements?',
    timestamp: '09:05 AM',
  },
  {
    id: 7,
    role: 'assistant',
    content: 'CIS Control 18 covers Penetration Testing. Organizations must establish and maintain a penetration testing program appropriate to their size, complexity, and maturity.\n\nFrequency requirements:\n• External penetration tests: no less than annually (safeguard 18.2)\n• Internal penetration tests: no less than annually (safeguard 18.5)\n\nThe program must define scope, rules of engagement, methodology, limitations, and remediation processes. Testing may be clear box or opaque box depending on the objective.',
    timestamp: '09:05 AM',
    sources: ['CIS Controls v8 · Control 18 · Pages 63–65'],
  },
]
