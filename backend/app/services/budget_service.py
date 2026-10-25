import math
from typing import List
from backend.app.schemas.destination import Destination
from backend.app.schemas.trip import CostBreakdown, BudgetSummary


class BudgetService:
    """
    Deterministic, testable budget calculator for Karnataka Yatra AI.
    Calculates line-item costs for stay, food, transit, entry fees, and safety buffer,
    scaled accurately by party size (solo, couples, families, and tour groups).
    """

    TRANSPORT_COST_PER_KM = {
        "public_bus": 2.8,     # KSRTC Sarige / Rajahamsa average per km per passenger
        "train": 2.2,          # South Western Railway Express / Vande Bharat blend per passenger
        "self_drive": 9.5,     # Fuel + self-drive rental per km (base car)
        "cab_rental": 14.0,    # Outstation cab rate per km (sedan base)
    }

    CAB_DAILY_DRIVER_BATA = 400

    EXPERIENCE_MULTIPLIERS = {
        "budget-friendly": {"stay": 0.70, "food": 0.80, "buffer_pct": 0.08},
        "balanced": {"stay": 1.00, "food": 1.00, "buffer_pct": 0.10},
        "relaxed": {"stay": 1.35, "food": 1.25, "buffer_pct": 0.12},
        "adventurous": {"stay": 0.95, "food": 1.05, "buffer_pct": 0.15},
    }

    @classmethod
    def calculate_budget(
        cls,
        requested_budget: int,
        duration_days: int,
        destinations: List[Destination],
        experience_preference: str,
        transport_mode: str,
        estimated_total_km: int,
        travelers_count: int = 1,
    ) -> BudgetSummary:
        travelers_count = max(1, travelers_count)
        nights = max(1, duration_days - 1)
        multipliers = cls.EXPERIENCE_MULTIPLIERS.get(
            experience_preference, cls.EXPERIENCE_MULTIPLIERS["balanced"]
        )

        # 1. Stay Cost calculation
        # In Karnataka standard hotels/homestays, rooms are double occupancy (2 per room).
        rooms_allocated = math.ceil(travelers_count / 2)
        if destinations:
            avg_base_stay = sum(d.estimated_stay_cost_per_night for d in destinations) / len(destinations)
        else:
            avg_base_stay = 1500.0

        daily_stay = avg_base_stay * multipliers["stay"]
        # Solo travelers get single-occupancy discount (0.9x room rate)
        occupancy_factor = 0.9 if travelers_count == 1 else 1.0
        total_stay = int(round(daily_stay * nights * rooms_allocated * occupancy_factor))

        # 2. Food Cost calculation: linear per traveler
        if destinations:
            avg_base_food = sum(d.estimated_daily_food_cost for d in destinations) / len(destinations)
        else:
            avg_base_food = 600.0

        daily_food = avg_base_food * multipliers["food"]
        total_food = int(round(daily_food * duration_days * travelers_count))

        # 3. Transport Cost calculation
        rate_per_km = cls.TRANSPORT_COST_PER_KM.get(transport_mode, 12.0)
        base_transit = estimated_total_km * rate_per_km

        if transport_mode in ["public_bus", "train"]:
            # Per passenger ticket pricing
            base_transit = base_transit * travelers_count
            total_transit = int(round(max(300 * travelers_count, base_transit)))
        elif transport_mode == "cab_rental":
            # Vehicle sizing based on party size:
            # 1-4 people: Sedan / Hatchback (1.0x)
            # 5-7 people: Innova / Ertiga SUV (1.35x)
            # 8-12 people: Tempo Traveller 12-seater (1.80x)
            # 13+ people: Mini-bus / 2 cabs (2.20x)
            if travelers_count <= 4:
                vehicle_mult = 1.0
            elif travelers_count <= 7:
                vehicle_mult = 1.35
            elif travelers_count <= 12:
                vehicle_mult = 1.80
            else:
                vehicle_mult = 2.20

            cab_transit = (base_transit * vehicle_mult) + (cls.CAB_DAILY_DRIVER_BATA * duration_days)
            total_transit = int(round(max(600, cab_transit)))
        elif transport_mode == "self_drive":
            if travelers_count <= 4:
                vehicle_mult = 1.0
            elif travelers_count <= 7:
                vehicle_mult = 1.30
            else:
                vehicle_mult = 1.90
            total_transit = int(round(max(500, base_transit * vehicle_mult)))
        else:
            total_transit = int(round(max(500, base_transit)))

        # 4. Activities & Entry Fees: charged per person at monuments, waterfalls, and sanctuaries
        base_entry = 0
        for dest in destinations:
            for att in dest.sample_attractions:
                base_entry += att.estimated_entry_fee_inr
        if base_entry == 0:
            base_entry = 150 * duration_days
        else:
            base_entry = min(base_entry, 600 * duration_days)

        total_entry = int(round(base_entry * travelers_count))

        # 5. Contingency Buffer
        subtotal = total_stay + total_food + total_transit + total_entry
        buffer_amount = int(round(subtotal * multipliers["buffer_pct"]))

        total_estimated = subtotal + buffer_amount
        remaining_buffer = requested_budget - total_estimated
        is_within_budget = total_estimated <= requested_budget
        per_person = int(round(total_estimated / travelers_count))

        breakdown = CostBreakdown(
            accommodation=total_stay,
            food=total_food,
            transport=total_transit,
            activities_entry=total_entry,
            contingency_reserve=buffer_amount,
        )

        return BudgetSummary(
            requested_budget=requested_budget,
            estimated_total_cost=total_estimated,
            remaining_buffer=remaining_buffer,
            is_within_budget=is_within_budget,
            cost_breakdown=breakdown,
            currency="INR",
            disclaimer="All prices are realistic sample estimates based on standard season averages. Booking prices fluctuate dynamically.",
            travelers_count=travelers_count,
            rooms_allocated=rooms_allocated,
            per_person_cost=per_person,
        )

    @classmethod
    def get_minimum_recommended_budget(
        cls,
        duration_days: int,
        transport_mode: str,
        travelers_count: int = 1,
    ) -> int:
        """
        Calculates baseline survival budget for Karnataka travel
        (budget lodge/homestay rooms + meals + transit + entry), accurately scaled for group size.
        """
        travelers_count = max(1, travelers_count)
        nights = max(1, duration_days - 1)
        rooms = math.ceil(travelers_count / 2)

        min_lodging = nights * 800 * rooms
        min_food = duration_days * 350 * travelers_count

        if transport_mode in ["public_bus", "train"]:
            min_transport = duration_days * (350 if transport_mode == "public_bus" else 250) * travelers_count
        elif transport_mode == "cab_rental":
            v_mult = 1.0 if travelers_count <= 4 else (1.35 if travelers_count <= 7 else 1.80)
            min_transport = int(duration_days * 2800 * v_mult)
        else:  # self_drive
            v_mult = 1.0 if travelers_count <= 4 else 1.30
            min_transport = int(duration_days * 1800 * v_mult)

        min_activities = duration_days * 100 * travelers_count
        min_buffer = int((min_lodging + min_food + min_transport + min_activities) * 0.08)
        return min_lodging + min_food + min_transport + min_activities + min_buffer
