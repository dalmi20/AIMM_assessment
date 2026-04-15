// URL du Google Apps Script Web App
// Après déploiement sur script.google.com, colle l'URL ici
export const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw4VqA-Yc4ank6hZxcn9jEC50-sb6LXqV1DiCywRIMgxupTQQyYjcVI4OXAF0PG0y2O/exec';

export async function uploadJsonToDrive(
  fileName: string,
  jsonContent: string
): Promise<string> {
  const res = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({ fileName, content: jsonContent }),
  });

  // no-cors ne retourne pas de réponse lisible — on suppose succès si pas d'erreur réseau
  void res;
  return `https://drive.google.com/drive/folders/1R35ZaK6pZGWF5y78B2UhpR5_vFJEdHkU`;
}
