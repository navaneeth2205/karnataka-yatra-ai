from typing import Optional
from fastapi import APIRouter, HTTPException, Query, Response, status
from backend.app.schemas.destination import DestinationListResponse
from backend.app.schemas.trip import (
    TripPlanRequest,
    TripPlanResponse,
    TripValidationResult,
    TripRevisionRequest,
)
from backend.app.services.destination_service import destination_service
from backend.app.services.itinerary_service import itinerary_service
from backend.app.services.validation_service import ValidationService
from backend.app.services.weather_service import WeatherService
from backend.app.core.config import settings

router = APIRouter()


@router.get(
    "/health",
    summary="Service Health Check",
    tags=["System"],
)
def health_check():
    dest_count = len(destination_service.all_destinations)
    return {
        "status": "healthy",
        "app_name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "destinations_count": dest_count,
        "active_llm_provider": settings.LLM_PROVIDER,
    }


@router.get(
    "/api/v1/weather/current",
    summary="Get live sensed weather and climate for a Karnataka city",
    tags=["Weather"],
)
def get_current_weather(
    response: Response,
    city: str = Query("Bengaluru", description="Karnataka hub city, e.g. Bengaluru, Mysuru, Mangaluru, Hubballi"),
):
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    try:
        return WeatherService.fetch_live_weather(city)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch live weather: {str(e)}",
        )


@router.get(
    "/api/v1/destinations",
    response_model=DestinationListResponse,
    summary="List and filter Karnataka destinations",
    tags=["Destinations"],
)
def list_destinations(
    interest: Optional[str] = Query(None, description="Filter by travel interest (e.g. heritage, beaches, nature)"),
    region: Optional[str] = Query(None, description="Filter by Karnataka region (e.g. coastal, western_ghats, heritage_circuit)"),
    search: Optional[str] = Query(None, description="Search keyword in name or tags"),
):
    items = destination_service.search_destinations(
        interest=interest,
        region=region,
        search=search,
    )
    return DestinationListResponse(total=len(items), items=items)


@router.post(
    "/api/v1/trips/plan",
    response_model=TripPlanResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate personalized itinerary",
    tags=["Trips"],
)
def plan_trip(request: TripPlanRequest):
    try:
        return itinerary_service.generate_plan(request)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate trip plan: {str(e)}",
        )


@router.post(
    "/api/v1/trips/validate",
    response_model=TripValidationResult,
    status_code=status.HTTP_200_OK,
    summary="Validate trip parameters and budget feasibility",
    tags=["Trips"],
)
def validate_trip(request: TripPlanRequest):
    try:
        return ValidationService.validate_trip_request(request)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Validation failed: {str(e)}",
        )


@router.post(
    "/api/v1/trips/revise",
    response_model=TripPlanResponse,
    status_code=status.HTTP_200_OK,
    summary="Revise an existing itinerary based on user instruction",
    tags=["Trips"],
)
def revise_trip(request: TripRevisionRequest):
    try:
        return itinerary_service.revise_itinerary(request)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to revise trip plan: {str(e)}",
        )
