# Karnataka Yatra AI - API Documentation

Base URL: `http://localhost:8000`

---

## 1. Health Check

### `GET /health`
Returns service status and loaded destination count.

**Response `200 OK`**:
```json
{
  "status": "healthy",
  "app_name": "Karnataka Yatra AI",
  "version": "1.0.0",
  "destinations_count": 12,
  "active_llm_provider": "deterministic"
}
```

---

## 2. Destinations List

### `GET /api/v1/destinations`
Query destinations with optional filtering.

**Query Parameters**:
- `interest` (optional): e.g. `heritage`, `nature`, `beaches`, `wildlife`, `food`, `spirituality`, `adventure`
- `region` (optional): `coastal`, `western_ghats`, `heritage_circuit`, `southern_karnataka`, `north_karnataka`
- `search` (optional): search string in destination title, tags, or description

**Response `200 OK`**:
```json
{
  "total": 12,
  "items": [
    {
      "id": "hampi",
      "name": "Hampi",
      "name_kannada": "ಹಂಪಿ",
      "region": "heritage_circuit",
      "interests": ["heritage", "spirituality"],
      "short_description": "UNESCO World Heritage Site with mesmerizing ruins of the Vijayanagara Empire.",
      "ideal_duration_days": 2,
      "estimated_stay_cost_per_night": 1200,
      "estimated_daily_food_cost": 500,
      "best_season": "October to March",
      "highlight_foods": ["Jolada Rotti Oota", "Mirchi Bajji", "Filter Coffee"],
      "tags": ["temples", "boulders", "history", "unesco"]
    }
  ]
}
```

---

## 3. Plan Itinerary

### `POST /api/v1/trips/plan`
Generates a structured, day-by-day Karnataka itinerary.

**Request Body**:
```json
{
  "starting_city": "Bengaluru",
  "duration_days": 3,
  "total_budget_inr": 15000,
  "interests": ["heritage", "nature"],
  "experience_preference": "balanced",
  "transport_mode": "cab_rental",
  "preferred_language": "kannada"
}
```

**Response `200 OK`**:
```json
{
  "trip_id": "ky-20261024-8192a",
  "starting_city": "Bengaluru",
  "duration_days": 3,
  "experience_preference": "balanced",
  "transport_mode": "cab_rental",
  "preferred_language": "kannada",
  "title": "Heritage & Nature Odyssey",
  "summary": "3-day curated expedition featuring Hampi & Belur-Halebidu.",
  "budget": {
    "requested_budget": 15000,
    "estimated_total_cost": 13400,
    "remaining_buffer": 1600,
    "is_within_budget": true,
    "cost_breakdown": {
      "accommodation": 4800,
      "food": 3300,
      "transport": 3500,
      "activities_entry": 800,
      "contingency_reserve": 1000
    },
    "currency": "INR",
    "disclaimer": "All prices are estimates based on standard season averages. Live bookings may vary."
  },
  "route_summary": {
    "total_distance_km": 680,
    "primary_circuit": "heritage_circuit",
    "stops": ["Bengaluru", "Belur", "Hampi"]
  },
  "days": [
    {
      "day_number": 1,
      "title": "Architectural Splendors of Hoysala Empire",
      "destination_name": "Belur & Halebidu",
      "destination_kannada": "ಬೇಲೂರು ಮತ್ತು ಹಳೇಬೀಡು",
      "morning_activity": {
        "time": "08:00 AM - 12:30 PM",
        "title": "Chennakeshava Temple Belur",
        "description": "Marvel at 12th-century Hoysala soapstone sculptures and star-shaped sanctum.",
        "estimated_entry_inr": 50,
        "is_estimate": true
      },
      "afternoon_activity": {
        "time": "01:00 PM - 04:00 PM",
        "title": "Hoysaleswara Temple at Halebidu",
        "description": "Explore twin shrines dedicated to Lord Shiva with intricate friezes.",
        "estimated_entry_inr": 50,
        "is_estimate": true
      },
      "evening_activity": {
        "time": "05:30 PM - 07:30 PM",
        "title": "Local Market & Filter Coffee",
        "description": "Stroll town center and taste Malnad specialty snacks.",
        "estimated_entry_inr": 0,
        "is_estimate": false
      },
      "cuisine_recommendations": ["Akki Rotti", "Neer Dosa", "Filter Coffee"],
      "day_budget_estimate": 3900,
      "travel_tip": "Carry slip-on shoes for temple entry."
    }
  ],
  "kannada_travel_phrases": [
    {"phrase": "Oota aayitha?", "translation": "Did you have food?", "meaning": "Common polite greeting in Karnataka"},
    {"phrase": "Idhu estu?", "translation": "How much is this?", "meaning": "Asking price in local shops"}
  ],
  "validation_warnings": []
}
```

---

## 4. Validate Itinerary Request

### `POST /api/v1/trips/validate`
Validates trip parameters before planning (e.g. budget feasibility, travel pacing).

**Request Body**: Same as `/api/v1/trips/plan`.

**Response `200 OK`**:
```json
{
  "is_valid": true,
  "warnings": [],
  "suggestions": [
    "Budget is well-allocated for balanced experience."
  ],
  "minimum_recommended_budget": 8500
}
```

---

## 5. Revise Itinerary

### `POST /api/v1/trips/revise`
Applies user requested adjustments (e.g., "reduce the budget", "add more heritage places", "switch to public transit").

**Request Body**:
```json
{
  "current_trip": { ... },
  "revision_instruction": "reduce the budget by 20%"
}
```

**Response `200 OK`**: Updated `TripPlanResponse` with revised pricing, activities, and budget adjustments.
