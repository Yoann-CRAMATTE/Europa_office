// Chiffrement optionnel d'un document.
// AES-GCM 256 bits, clé dérivée du mot de passe par PBKDF2-SHA256.
// Tout se passe dans le navigateur : aucun mot de passe ne quitte la machine.

const ITERATIONS = 310_000 // recommandation OWASP 2023 pour PBKDF2-SHA256
const OCTETS_SEL = 16
const OCTETS_IV = 12

export interface DocumentChiffre {
  format: 'europa/1-chiffre'
  kdf: 'PBKDF2-SHA256'
  iterations: number
  /** Sel en base64. */
  sel: string
  /** Vecteur d'initialisation en base64. */
  iv: string
  /** Document JSON chiffré, en base64. */
  charge: string
}

const enc = new TextEncoder()
const dec = new TextDecoder()

const versB64 = (b: ArrayBuffer): string =>
  btoa(String.fromCharCode(...new Uint8Array(b)))

// On construit le tableau explicitement : Uint8Array.from() produit un type
// adossé à ArrayBufferLike, que l'API WebCrypto refuse (SharedArrayBuffer exclu).
const depuisB64 = (s: string): Uint8Array<ArrayBuffer> => {
  const bin = atob(s)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

async function deriverCle (
  motDePasse: string,
  sel: Uint8Array<ArrayBuffer>,
  iterations: number
): Promise<CryptoKey> {
  const base = await crypto.subtle.importKey(
    'raw', enc.encode(motDePasse), 'PBKDF2', false, ['deriveKey']
  )
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: sel, iterations, hash: 'SHA-256' },
    base,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

export async function chiffrer (docJson: string, motDePasse: string): Promise<DocumentChiffre> {
  const sel = crypto.getRandomValues(new Uint8Array(OCTETS_SEL))
  const iv = crypto.getRandomValues(new Uint8Array(OCTETS_IV))
  const cle = await deriverCle(motDePasse, sel, ITERATIONS)
  const chiffre = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv }, cle, enc.encode(docJson)
  )
  return {
    format: 'europa/1-chiffre',
    kdf: 'PBKDF2-SHA256',
    iterations: ITERATIONS,
    sel: versB64(sel.buffer),
    iv: versB64(iv.buffer as ArrayBuffer),
    charge: versB64(chiffre)
  }
}

/** Lance une erreur si le mot de passe est faux : AES-GCM authentifie la charge. */
export async function dechiffrer (paquet: DocumentChiffre, motDePasse: string): Promise<string> {
  const cle = await deriverCle(motDePasse, depuisB64(paquet.sel), paquet.iterations)
  try {
    const clair = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: depuisB64(paquet.iv) }, cle, depuisB64(paquet.charge)
    )
    return dec.decode(clair)
  } catch {
    throw new Error('Mot de passe incorrect.')
  }
}

export function estChiffre (valeur: unknown): valeur is DocumentChiffre {
  return typeof valeur === 'object' && valeur !== null &&
    (valeur as DocumentChiffre).format === 'europa/1-chiffre'
}
