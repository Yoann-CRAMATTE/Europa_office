// Porte de déverrouillage d'un document chiffré.
// Reste affichée tant que le mot de passe n'est pas accepté.

export function demanderMotDePasse (
  tenter: (motDePasse: string) => Promise<string>
): Promise<string> {
  return new Promise(resolve => {
    const porte = document.createElement('div')
    porte.className = 'eu-porte'
    porte.innerHTML = `
      <div class="eu-porte-carte">
        <div class="eu-porte-cadenas">&#128274;</div>
        <h1>Ce document est chiffré.</h1>
        <p>Saisissez le mot de passe pour l'ouvrir.</p>
        <input type="password" autocomplete="current-password" />
        <button type="button">Déverrouiller</button>
        <div class="eu-porte-erreur" role="alert"></div>
      </div>`
    document.body.appendChild(porte)
    document.getElementById('europa-amorce')?.remove()

    const champ = porte.querySelector('input') as HTMLInputElement
    const bouton = porte.querySelector('button') as HTMLButtonElement
    const erreur = porte.querySelector('.eu-porte-erreur') as HTMLElement
    champ.focus()

    const essayer = async (): Promise<void> => {
      bouton.disabled = true
      erreur.textContent = ''
      try {
        const clair = await tenter(champ.value)
        porte.remove()
        resolve(clair)
      } catch (e) {
        erreur.textContent = e instanceof Error ? e.message : String(e)
        champ.select()
      } finally {
        bouton.disabled = false
      }
    }

    bouton.addEventListener('click', () => void essayer())
    champ.addEventListener('keydown', e => { if (e.key === 'Enter') void essayer() })
  })
}
