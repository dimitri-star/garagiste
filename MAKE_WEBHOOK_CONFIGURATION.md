# Configuration du Webhook Make.com pour la création de devis

## Problème résolu

Le frontend n'appelle plus Make.com pour déclencher le workflow. Le workflow Make.com est responsable de créer/mettre à jour le devis dans Supabase via un **upsert**. 

Pour éviter l'erreur `duplicate key value violates unique constraint "devis_pkey"`, voici comment configurer Make.com :

## Structure du payload envoyé par le frontend

Le frontend envoie ce payload au webhook Make.com :

```json
{
  "devisId": "uuid-du-devis",
  "numeroDevis": "DEV-2025-123456",
  "client": {
    "id": "client-id",
    "nom": "Nom du client",
    "email": "email@example.com",
    "telephone": "+33123456789"
  },
  "vehicule": {
    "id": "vehicule-id",
    "immatriculation": "AB-123-CD",
    "marque": "Renault",
    "modele": "Clio"
  },
  "lignes": [
    {
      "type": "prestation",
      "designation": "Vidange",
      "quantite": 1,
      "prixUnitaireHT": 50,
      "tauxTVA": 20,
      "totalHT": 50
    }
  ],
  "totaux": {
    "sousTotalPrestations": 50,
    "sousTotalPieces": 0,
    "totalHT": 50,
    "tva": 10,
    "remise": 0,
    "remiseType": "pourcent",
    "totalTTC": 60
  },
  "commentaires": "Commentaires optionnels"
}
```

## Configuration du module Supabase dans Make.com

### Option 1 : Utiliser `upsert` avec gestion d'erreur (RECOMMANDÉ)

1. **Dans le module Supabase "Upsert a Record"** :
   - **Conflict Resolution** : Sélectionner `id` (ou la clé primaire de votre table `devis`)
   - Cela permet à Supabase de faire un UPDATE si l'ID existe, ou un INSERT s'il n'existe pas

2. **Gestion des erreurs** :
   - Ajouter un module **"Error Handler"** après le module Supabase
   - Dans le module Error Handler, vérifier si l'erreur contient `duplicate key` ou `unique constraint`
   - Si oui, considérer ça comme un succès et continuer

3. **Format de réponse standardisé** :
   - Après le module Supabase (ou Error Handler), formater la réponse dans un module **"Set variables"** ou **"JSON"**

### Option 2 : Utiliser une logique conditionnelle (ALTERNATIVE)

1. **Vérifier si le devis existe** avec un module Supabase "Get a Record"
2. **Si existe** : Utiliser "Update a Record"
3. **Si n'existe pas** : Utiliser "Insert a Record"
4. **Dans tous les cas** : Mettre le statut à `"généré"` après l'opération

## Format de réponse attendu par le frontend

Le webhook Make.com doit retourner **obligatoirement** un code HTTP de succès (200, 201, 202, 204) avec ce format JSON :

### En cas de succès (devis créé ou mis à jour)

```json
{
  "success": true,
  "devisId": "uuid-du-devis",
  "message": "Devis créé/mis à jour avec succès",
  "statut": "généré"
}
```

### En cas d'erreur de contrainte unique (devis existe déjà)

**IMPORTANT** : Même si Supabase retourne une erreur de contrainte unique, Make.com doit retourner un **succès** avec ce format :

```json
{
  "success": true,
  "devisId": "uuid-du-devis",
  "message": "Devis déjà existant, mis à jour",
  "statut": "généré",
  "errorType": "duplicate_key",
  "note": "Le devis existait déjà, il a été mis à jour"
}
```

### En cas d'erreur réelle

```json
{
  "success": false,
  "error": "Description de l'erreur",
  "errorType": "database_error"
}
```

## Exemple de workflow Make.com recommandé

```
1. [Webhook] Reçoit le payload du frontend
   ↓
2. [JSON] Formate les données pour Supabase
   ↓
3. [Supabase] Upsert a Record
   - Table: devis
   - Conflict Resolution: id
   - Data: { id, numero, date, client_id, vehicule_id, ... }
   ↓
4. [Error Handler] Capture les erreurs
   - Si erreur contient "duplicate key" → Continuer
   - Sinon → Arrêter et retourner l'erreur
   ↓
5. [Supabase] Update Record (pour mettre le statut à "généré")
   - Table: devis
   - Filter: id = {{devisId}}
   - Data: { statut: "généré", pdf_url: "..." }
   ↓
6. [Set variables] Formate la réponse
   - success: true
   - devisId: {{devisId}}
   - message: "Devis généré avec succès"
   ↓
7. [Webhook Response] Retourne la réponse au frontend
   - HTTP Status: 200
   - Body: {{response}}
```

## Points importants

1. **Le devis doit être créé/mis à jour par Make.com**, pas par le frontend
2. **Le statut doit être mis à `"généré"`** après l'upsert dans Supabase
3. **Une erreur de contrainte unique doit être considérée comme un succès** (le devis existe déjà, c'est normal)
4. **Le webhook doit toujours retourner un code HTTP 200-204** en cas de succès, même si le devis existait déjà
5. **Le format JSON de réponse doit être standardisé** pour que le frontend puisse gérer tous les cas

## Test

Pour tester, essayez de créer un devis avec un `devisId` qui existe déjà. Le workflow doit :
- ✅ Mettre à jour le devis existant
- ✅ Retourner un succès (HTTP 200)
- ✅ Mettre le statut à "généré"
- ✅ Afficher "Devis généré avec succès" dans le frontend

