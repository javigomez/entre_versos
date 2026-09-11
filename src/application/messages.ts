export type Message = { id: string; role: 'master' | 'player'; text: string; action?: string; kind?: 'verse' | 'success'; label?: string };
