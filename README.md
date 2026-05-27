# RecSys — Système de recommandation hybride (Collaborative Filtering + Content-Based)

> Recommandez les bons produits, au bon client, au bon moment.

[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat&logo=next.js)](https://nextjs.org)
[![LightFM](https://img.shields.io/badge/LightFM-1.17-orange?style=flat)](https://making.lyst.com/lightfm/docs/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat&logo=postgresql)](https://postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=flat&logo=redis)](https://redis.io)

---

## Table des matières
1. [Vue d'ensemble](#vue-densemble)
2. [Stack technique](#stack-technique)
3. [Architecture mono-repo](#architecture-mono-repo)
4. [Diagrammes UML](#diagrammes-uml)
5. [PRD](#prd)
6. [User Stories](#user-stories)
7. [Règles métier](#règles-métier)
8. [Spécification API](#spécification-api)
9. [Simulation UI](#simulation-ui)
10. [Dataset](#dataset)
11. [Déploiement](#déploiement)
12. [CI/CD](#cicd)
13. [Roadmap](#roadmap)

---

## Vue d'ensemble

RecSys est un système de recommandation hybride combinant le **filtrage collaboratif** (LightFM — interactions utilisateur-item) et le **filtrage basé sur le contenu** (similarité cosinus sur métadonnées item). Cette approche hybride résout le problème de cold-start (nouveaux utilisateurs ou nouveaux items) tout en exploitant les patterns comportementaux collectifs.

**Domaine :** E-commerce / Streaming / Marketplace  
**Dataset :** [MovieLens 20M (Kaggle)](https://www.kaggle.com/datasets/grouplens/movielens-20m-dataset) — 20M ratings, 27 000 films, 138 000 utilisateurs  
**Port VM :** 3035 | **Sous-domaine :** recsys.wikolabs.com

---

## Stack technique

| Couche | Technologie | Rôle |
|--------|------------|------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Recharts | Catalogue + panneau recommandations + A/B test UI |
| Backend | FastAPI (Python 3.11), Uvicorn, Pydantic v2 | API recommandations, logging interactions |
| ML — Collaboratif | LightFM (WARP loss) | Factorisation matricielle implicite hybride |
| ML — Contenu | scikit-learn (TF-IDF + cosine), numpy | Similarité par métadonnées item |
| ML — Implicit | implicit (ALS) | Alternative collaborative filtering sur feedback implicite |
| Base de données | PostgreSQL 16 (users, items, interactions) | Source de vérité |
| Cache | Redis 7 | Recommandations pré-calculées par user (TTL 1h) |
| Infra | Docker Compose, Nginx | VM mono-repo (port 3035) |
| CI/CD | GitHub Actions → SSH deploy | Push to main → deploy |

### backend/requirements.txt
```
fastapi==0.111.0
uvicorn[standard]==0.29.0
lightfm==1.17
implicit==0.7.2
scikit-learn==1.4.2
scipy==1.13.0
pandas==2.2.2
numpy==1.26.4
redis==5.0.4
asyncpg==0.29.0
sqlalchemy[asyncio]==2.0.30
pydantic==2.7.1
apscheduler==3.10.4
joblib==1.4.0
```

---

## Architecture mono-repo

```
recsys/
├── frontend/
│   ├── src/app/
│   │   ├── page.tsx             # Catalogue produits + reco panel
│   │   ├── user/[id]/           # Profil utilisateur + historique
│   │   └── ab-test/             # Dashboard A/B test CTR
│   └── src/components/
│       ├── ProductGrid.tsx      # Grille produits avec badge "Recommandé"
│       ├── RecoPanel.tsx        # Panel "Vous pourriez aimer"
│       ├── ExplanationTooltip.tsx # "Parce que vous avez vu X"
│       └── ABTestToggle.tsx     # Switch control/traitement
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── routers/
│   │   │   ├── recommendations.py # GET /recommend/{user_id}
│   │   │   ├── interactions.py    # POST /interact (log click/purchase)
│   │   │   └── items.py           # CRUD catalogue
│   │   ├── services/
│   │   │   ├── hybrid_recommender.py # LightFM + content blend
│   │   │   ├── content_based.py      # TF-IDF cosine similarity
│   │   │   ├── collaborative.py      # LightFM WARP
│   │   │   ├── cold_start.py         # Nouveaux users → popularity
│   │   │   └── scheduler.py          # Retrain hebdomadaire
│   │   └── models/
│   │       ├── user.py
│   │       ├── item.py
│   │       └── interaction.py
│   ├── requirements.txt
│   └── Dockerfile
├── docker-compose.yml
└── .github/workflows/deploy.yml
```

---

## Diagrammes UML

### Architecture système

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'primaryColor': '#f59e0b', 'primaryTextColor': '#1c1917', 'primaryBorderColor': '#d97706', 'lineColor': '#374151', 'secondaryColor': '#fffbeb'}}}%%
flowchart TB
    subgraph CLIENT["🌐 Utilisateurs"]
        USER["Browser / App mobile"]
    end

    subgraph VM["🖥️ VM — Docker Compose (port 3035)"]
        NEXT["Next.js 14\nCatalogue + Recos"]
        API["FastAPI\nAPI recommandations"]

        subgraph ML["🧠 ML Engine"]
            LFM["LightFM\n(Collaborative)"]
            CB["Content-Based\n(TF-IDF cosine)"]
            BLEND["Hybrid Blender\n60% CF + 40% CB"]
            CS["Cold-Start\n(Popularity baseline)"]
        end

        REDIS[("Redis\nCache recos user")]
        PG[("PostgreSQL\nUsers, Items,\nInteractions")]
        SCHED["Scheduler\nRetrain hebdo"]
    end

    USER --> NEXT --> API
    API --> REDIS
    REDIS -->|"Cache miss"| BLEND
    BLEND --> LFM
    BLEND --> CB
    API --> CS
    API --> PG
    SCHED --> LFM
    SCHED --> CB
```

### Séquence — Génération de recommandations

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'primaryColor': '#f59e0b', 'primaryTextColor': '#1c1917', 'lineColor': '#374151'}}}%%
sequenceDiagram
    participant U as Utilisateur
    participant API as FastAPI
    participant RD as Redis
    participant BLEND as Hybrid Blender
    participant LFM as LightFM
    participant CB as Content-Based
    participant PG as PostgreSQL

    U->>API: GET /recommend/{user_id}?n=10
    API->>RD: GET recos:{user_id}
    RD-->>API: HIT → retourner cache (TTL 1h)

    Note over API: Cache MISS :

    API->>PG: GET user interactions history
    PG-->>API: 45 interactions (clicks, purchases, ratings)

    alt Utilisateur établi (≥ 5 interactions)
        API->>LFM: predict_rank(user_id, all_items)
        LFM-->>BLEND: top-50 scores collaboratifs

        API->>CB: content_similar(user_profile_items, all_items)
        CB-->>BLEND: top-50 scores contenu

        BLEND->>BLEND: blend(0.6 × CF + 0.4 × CB)
        BLEND->>BLEND: apply_diversity(max 2 per category)
        BLEND->>BLEND: apply_business_boost(high_margin × 1.1)
        BLEND->>BLEND: filter_unavailable()
        BLEND-->>API: top-10 items

    else Nouveau utilisateur (< 5 interactions)
        API->>PG: GET popular_items(category_preference)
        PG-->>API: top-10 popular
    end

    API->>RD: SET recos:{user_id} TTL=3600s
    API-->>U: [{item, score, explanation, rank}×10]
```

### Modèle de données (ER)

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'primaryColor': '#f59e0b', 'primaryTextColor': '#1c1917', 'lineColor': '#374151'}}}%%
erDiagram
    USER {
        uuid id PK
        string external_id
        jsonb category_preferences
        int interaction_count
        timestamp first_seen
        timestamp last_active
        string cohort
        string ab_group
    }
    ITEM {
        uuid id PK
        string external_id
        string title
        string category
        string[] tags
        float price
        float margin_pct
        boolean is_available
        int view_count
        int purchase_count
        timestamp created_at
    }
    INTERACTION {
        uuid id PK
        uuid user_id FK
        uuid item_id FK
        string event_type
        float weight
        timestamp created_at
        string session_id
    }
    RECOMMENDATION_LOG {
        uuid id PK
        uuid user_id FK
        uuid item_id FK
        float score
        string explanation
        string model_version
        boolean was_clicked
        boolean was_purchased
        timestamp served_at
    }

    USER ||--o{ INTERACTION : "génère"
    ITEM ||--o{ INTERACTION : "reçoit"
    USER ||--o{ RECOMMENDATION_LOG : "reçoit"
    ITEM ||--o{ RECOMMENDATION_LOG : "apparaît dans"
```

### Diagramme — Flux hybride

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'primaryColor': '#16a34a', 'primaryTextColor': '#fff', 'lineColor': '#374151'}}}%%
flowchart LR
    subgraph INPUT["Données d'entrée"]
        UI["Interactions user\n(clics, achats, notes)"]
        META["Métadonnées items\n(catégorie, tags, prix)"]
    end

    subgraph CF["Filtrage Collaboratif\n(LightFM WARP)"]
        UE["Embedding\nutilisateur 64-dim"]
        IE["Embedding\nitem 64-dim"]
        DOT["Dot product\n→ score CF"]
    end

    subgraph CB_BOX["Filtrage Contenu\n(TF-IDF cosine)"]
        TFIDF["TF-IDF\nvecteur item"]
        COS["Cosine similarity\nuser profile vs items"]
    end

    BLEND2["Blender\n0.6×CF + 0.4×CB"]
    RULES2["Règles business\nDiversité, boost marge,\ndispo stock"]
    OUT["Top-10 recommandations\navec explication"]

    UI --> CF
    META --> CB_BOX
    UI --> CB_BOX
    CF --> BLEND2
    CB_BOX --> BLEND2
    BLEND2 --> RULES2 --> OUT
```

---

## PRD

### Problème
En e-commerce, 35% du revenu Amazon provient des recommandations (McKinsey). Les catalogues avec des milliers de SKUs saturent l'utilisateur — sans recommandation pertinente, le taux de conversion chute. Les recommandations par popularité simple ignorent les préférences individuelles.

### Solution
Système hybride : utilise le comportement collectif (qui a acheté quoi) ET les métadonnées produits (catégorie, tags, prix) pour des recommandations personnalisées resilientes au cold-start. A/B test intégré pour mesurer l'impact sur le CTR et la conversion.

### Utilisateurs cibles
| Persona | Besoin |
|---------|--------|
| E-commerçant | Augmenter panier moyen, réduire taux de rebond |
| Product Manager | Mesurer le lift des recommandations ML vs popularité |
| Développeur | API REST simple à intégrer dans n'importe quelle plateforme |

### OKRs
- CTR des recommandations > 8% (vs 2% popularité simple)
- Augmentation panier moyen de 12% via cross-sell
- Latence réponse API < 100ms (avec cache Redis)
- Cold-start fallback : 100% des utilisateurs reçoivent des recos

---

## User Stories

```
US-01 [Client] En tant que client,
      je veux voir "Vous pourriez aimer" basé sur mes achats passés
      afin de découvrir des produits pertinents sans chercher.

US-02 [Système] En tant que moteur de reco,
      je veux détecter si un utilisateur a < 5 interactions
      et lui servir des recommandations basées sur la popularité de sa catégorie
      afin de ne jamais renvoyer une liste vide (cold-start).

US-03 [PM] En tant que Product Manager,
      je veux un A/B test natif entre recos ML et recos popularité
      afin de mesurer le lift réel sur le CTR et la conversion.

US-04 [Commerçant] En tant que commerçant,
      je veux définir un "business boost" pour les produits à forte marge
      afin de les favoriser légèrement dans les recommandations.

US-05 [Client] En tant que client,
      je veux une explication "Parce que vous avez acheté X"
      afin de comprendre pourquoi ce produit m'est recommandé.

US-06 [Dev] En tant que développeur,
      je veux logger chaque impression et clic via POST /interact
      afin d'alimenter le modèle avec des données fraîches.
```

---

## Règles métier

Simulables dans l'UI via catalogue mock + générateur d'interactions.

| # | Règle | Description | Simulable UI |
|---|-------|-------------|-------------|
| R1 | Cold-start threshold | < 5 interactions → popularity baseline | ✅ Compteur interactions |
| R2 | Returning user blend | 60% Collaborative + 40% Content-Based | ✅ Slider blend ratio |
| R3 | Diversity constraint | Max 2 items de la même catégorie dans top-10 | ✅ Visible dans résultats |
| R4 | Popularity inclusion | Toujours 1 item trending dans top-10 | ✅ Badge "Tendance" |
| R5 | Recency decay | Interactions > 90j : poids × 0.5 | ✅ Slider decay |
| R6 | Business boost | Marge élevée → score × 1.1 (configurable) | ✅ Toggle par item |
| R7 | Availability filter | Items en rupture de stock exclus | ✅ Toggle stock |
| R8 | Real-time update | Nouvelle interaction → cache invalidé dans 60s | ✅ Bouton "Simuler achat" |
| R9 | Explanation | "Parce que vous avez vu X" / "Tendance dans votre catégorie" | ✅ Tooltip |
| R10 | A/B group | user.ab_group ∈ {control, treatment} → modèle différent | ✅ Toggle A/B |

### Fonction de score hybride
```python
score_hybride(user, item) = (
    0.6 * lightfm_score(user, item) +
    0.4 * content_similarity(user_profile, item) +
    business_boost(item.margin_pct)
)
```

### Poids des événements (implicit feedback)
```python
INTERACTION_WEIGHTS = {
    "purchase": 10.0,   # Signal fort
    "add_to_cart": 5.0,
    "wishlist": 3.0,
    "detail_view": 1.5,
    "impression": 0.5,  # Signal faible
}
```

---

## Spécification API

**Base URL :** `http://recsys.wikolabs.com/api/v1`

### GET /recommend/{user_id}
```json
// Response
[
  {
    "item_id": "item_uuid",
    "title": "Casque Sony WH-1000XM5",
    "score": 0.943,
    "rank": 1,
    "explanation": "Parce que vous avez acheté Sony WH-1000XM4",
    "category": "Audio",
    "price": 299.99,
    "is_trending": false
  }
]
```
**Params :** `?n=10&category=audio&exclude_purchased=true&ab_group=treatment`

### POST /interact
```json
{
  "user_id": "user_uuid",
  "item_id": "item_uuid",
  "event_type": "purchase",
  "session_id": "sess_abc"
}
```

### GET /items/{id}/similar
Retourne les N items les plus similaires par contenu (TF-IDF cosine).

### GET /analytics/ab-test
```json
{
  "period": "last_7d",
  "control": {"n": 1423, "ctr": 0.023, "conversion": 0.041},
  "treatment": {"n": 1389, "ctr": 0.087, "conversion": 0.061},
  "lift_ctr": "+278%",
  "p_value": 0.0001,
  "significant": true
}
```

### POST /retrain
Déclenche un re-entraînement complet du modèle LightFM (job asynchrone).

---

## Simulation UI

Interface demo **sans API externe**, avec catalogue mock MovieLens.

| Composant | Description |
|-----------|-------------|
| **Product Catalog** | Grille de films avec poster, genre, note moyenne |
| **"Vous pourriez aimer"** | Panel lateral avec top-10 recos + explanation tooltip |
| **Interaction Simulator** | Cliquer sur "Voir" / "Ajouter au panier" / "Acheter" → score local recalculé |
| **Cold-Start Demo** | Bouton "Nouveau utilisateur" → affiche recos popularité |
| **A/B Test Dashboard** | Toggle control/treatment → comparer CTR simulé |
| **Blend Ratio Slider** | Ajuster 60/40 → voir impact sur les recos en temps réel |
| **Business Boost Panel** | Activer boost sur des items → les voir remonter dans le classement |

---

## Dataset

**Kaggle :** [MovieLens 20M](https://www.kaggle.com/datasets/grouplens/movielens-20m-dataset)

```bash
kaggle datasets download -d grouplens/movielens-20m-dataset -p backend/app/ml/data/
```

**Contenu :** 20 000 263 ratings, 27 278 films, 138 493 utilisateurs. Ratings de 0.5 à 5.0. Utilisé pour entraîner LightFM (binarisé : rating > 3.5 = interaction positive) et valider le pipeline de recommandation.

---

## Déploiement

```yaml
# docker-compose.yml
version: "3.9"
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: recsys
      POSTGRES_USER: rs_user
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes: [pg_data:/var/lib/postgresql/data]

  redis:
    image: redis:7-alpine
    command: redis-server --maxmemory 512mb --maxmemory-policy allkeys-lru

  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql+asyncpg://rs_user:${POSTGRES_PASSWORD}@postgres/recsys
      REDIS_URL: redis://redis:6379
      MODEL_DIR: /app/ml/artifacts
      RETRAIN_SCHEDULE: "0 3 * * 0"
    volumes:
      - model_data:/app/ml/artifacts
    expose: ["8000"]

  frontend:
    build: ./frontend
    expose: ["3000"]

  nginx:
    image: nginx:alpine
    ports: ["3035:80"]
    volumes: ["./nginx.conf:/etc/nginx/nginx.conf:ro"]

volumes:
  pg_data:
  model_data:
```

---

## CI/CD

```yaml
name: Deploy RecSys
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.VM_HOST }}
          username: ${{ secrets.VM_USER }}
          key: ${{ secrets.VM_SSH_KEY }}
          script: |
            cd /opt/recsys && git pull origin main
            docker compose up -d --build
            docker compose exec backend alembic upgrade head
```

---

## Roadmap

### Phase 1 — MVP (Semaines 1–4)
- [ ] Pipeline LightFM WARP sur MovieLens 20M
- [ ] Content-Based TF-IDF sur métadonnées films
- [ ] API FastAPI + cache Redis
- [ ] UI catalogue + panel recos avec explanations

### Phase 2 — Production (Semaines 5–8)
- [ ] A/B test framework intégré (assignment + analytics)
- [ ] Cold-start popularity baseline
- [ ] Logging interactions → feedback loop
- [ ] Retrain hebdomadaire automatique

### Phase 3 — Avancé (Semaines 9–12)
- [ ] Session-based recommendations (GRU4Rec)
- [ ] Diversity-Accuracy tradeoff configurable
- [ ] Two-tower neural model (remplace LightFM)
- [ ] Integration Shopify / WooCommerce webhook

---

*Un produit [Wikolabs](https://wikolabs.com) — Intelligence artificielle appliquée aux métiers*
