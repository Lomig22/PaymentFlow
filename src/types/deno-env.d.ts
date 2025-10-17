/* Ambient declarations to silence IDE TypeScript errors for Deno edge functions. */

// Deno global (Edge Functions runtime)
declare const Deno: any;

// Minimal typing for Deno std serve import when parsed by tsserver/IDE in a non-Deno project
declare module "https://deno.land/std@0.177.0/http/server.ts" {
  export function serve(handler: (req: Request) => Response | Promise<Response>): void;
}
