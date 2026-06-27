module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prenom, nom, tel, email, localisation, type, message, vehicule } = req.body;

  const sujet = type ? `Nouvelle demande — ${type}` : 'Nouvelle demande via le site';

  const lignes = [
    prenom || nom ? `<tr><td><strong>Nom</strong></td><td>${[prenom, nom].filter(Boolean).join(' ')}</td></tr>` : '',
    tel  ? `<tr><td><strong>Téléphone</strong></td><td>${tel}</td></tr>` : '',
    email ? `<tr><td><strong>Email</strong></td><td>${email}</td></tr>` : '',
    localisation ? `<tr><td><strong>Localisation</strong></td><td>${localisation}</td></tr>` : '',
    type ? `<tr><td><strong>Type de demande</strong></td><td>${type}</td></tr>` : '',
    vehicule ? `<tr><td><strong>Véhicule</strong></td><td>${vehicule}</td></tr>` : '',
    message ? `<tr><td><strong>Message</strong></td><td>${message}</td></tr>` : '',
  ].filter(Boolean).join('');

  const html = `
    <h2 style="font-family:sans-serif;color:#E85D04">Apex Dépannage — Nouvelle demande</h2>
    <table style="font-family:sans-serif;font-size:15px;border-collapse:collapse;width:100%;max-width:560px">
      ${lignes}
    </table>
  `;

  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY manquante');
    return res.status(500).json({ error: 'Configuration manquante' });
  }

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Apex Dépannage <onboarding@resend.dev>',
        to: ['contact@apexdepannage.fr'],
        reply_to: email || undefined,
        subject: sujet,
        html,
      }),
    });

    if (!r.ok) {
      const err = await r.text();
      console.error('Resend error:', err);
      return res.status(500).json({ error: 'Erreur envoi email', detail: err });
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
