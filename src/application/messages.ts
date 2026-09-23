export type Message = { id: string; role: 'mestre' | 'player'; text: string; action?: string; kind?: 'verse' | 'success'; label?: string };
