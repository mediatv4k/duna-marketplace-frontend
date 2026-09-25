const fs = require('fs');
let code = fs.readFileSync('src/components/OrderTrackingModal.tsx', 'utf8');

// Find and replace the exact block using string split
const START_MARKER = 'let currentParticipant = \'\';\n                            \n                            const rawLines = Array.isArray(item.breakdown) ? item.breakdown : [];\n                            rawLines.forEach((line: string) => {\n                              const trimmed = line.trim();\n                              \n                              // Check for participant name header';
const END_MARKER = '                            });\n                            \n                            // Fallback to item.variants if no string-based extras found';

const startIdx = code.indexOf(START_MARKER);
const endIdx = code.indexOf(END_MARKER, startIdx);

if (startIdx === -1 || endIdx === -1) {
  console.log('Markers not found:', startIdx, endIdx);
  process.exit(1);
}

const REPLACEMENT = `let currentParticipant = '';
                            
                            const rawLines = Array.isArray(item.breakdown) ? item.breakdown : [];
                            // ─── FINANCIAL EXTRAS PARSER (RECEIPT ONLY) ────────────────
                            // Reads breakdown[] lines from MasterProductModal.
                            // Slot format  : "• #1 (Omar): ..." / "  >> EXTRA: [SKU] Name (+$X.XX)"
                            // ComboRoom fmt: "• OMAR (1 Unidades)" / "  - Name (+$X.XX)"
                            rawLines.forEach((line: string) => {
                              const trimmed = line.trim();

                              // ── Participant header detection ──
                              // Matches "• OMAR (1 Unidades)" or "• #1 (Omar):"
                              // Bullet may be any non-word char (Unicode corruption safe)
                              const headerMatchA = trimmed.match(/^[^\\w]*#?\\d*\\s*([A-Za-z\\u00C0-\\u017E][A-Za-z\\u00C0-\\u017E0-9 ]*?)\\s*\\(\\d+\\s*Unidades?\\)/i);
                              const headerMatchB = !headerMatchA && trimmed.match(/^[^\\w]*#(\\d+)\\s*\\(([^)]+)\\)\\s*:/i);

                              if (headerMatchA) {
                                currentParticipant = headerMatchA[1].trim();
                                return;
                              }
                              if (headerMatchB) {
                                currentParticipant = headerMatchB[2].trim();
                                return;
                              }

                              // ── Skip pure kitchen-prep lines ──
                              if (/^\\s*-\\s*sin\\b/i.test(trimmed)) return;
                              if (/sale con todo/i.test(trimmed)) return;
                              if (/^---/.test(trimmed)) return;

                              // ── Price extraction: (+$X.XX) anywhere in line ──
                              const priceMatch = trimmed.match(/\\(\\+\\$\\s*([0-9]+(?:\\.[0-9]{1,2})?)\\)/);
                              if (priceMatch) {
                                const extPrice = Number(priceMatch[1]);
                                const cleanedName = trimmed
                                  .replace(/^-\\s*/, '')
                                  .replace(/^>>\\s*EXTRA:\\s*/i, '')
                                  .replace(/\\[[^\\]]*\\]\\s*/g, '')
                                  .replace(/\\(\\+\\$[0-9.]+\\)/g, '')
                                  .replace(/\\s{2,}/g, ' ')
                                  .trim();

                                if (cleanedName.length > 0 && extPrice > 0) {
                                  financialExtras.push({ name: cleanedName, participant: currentParticipant, price: extPrice });
                                }
                              }
                            });
                            
                            // Fallback to item.variants if no string-based extras found`;

code = code.substring(0, startIdx) + REPLACEMENT + code.substring(endIdx + END_MARKER.length);
fs.writeFileSync('src/components/OrderTrackingModal.tsx', code);
console.log('Parser replaced successfully');
