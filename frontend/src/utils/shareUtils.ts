import { TripPlanResponse } from '../types/travel';

/**
 * Formats a clean, high-impact WhatsApp message optimized for mobile readability,
 * with emojis, party size, seasonal prediction notes, day highlights, and Kannada phrases.
 */
export const formatWhatsAppItinerary = (trip: TripPlanResponse): string => {
  const lines: string[] = [];
  const travelers = trip.travelers_count || trip.budget.travelers_count || 1;
  const rooms = trip.budget.rooms_allocated || Math.ceil(travelers / 2);
  const perPerson = trip.budget.per_person_cost || Math.round(trip.budget.estimated_total_cost / travelers);
  const season = (trip.travel_season || 'winter').toUpperCase();

  lines.push('🚩 *KARNATAKA YATRA AI* 🚩');
  lines.push('_Personalized Travel Guide_');
  lines.push('━━━━━━━━━━━━━━━━━━━━');
  lines.push(`✨ *${trip.title}*`);
  lines.push(`📍 Gateway: *${trip.starting_city}*`);
  lines.push(`🗓️ Duration: *${trip.duration_days} Days / ${Math.max(1, trip.duration_days - 1)} Nights*`);
  lines.push(`👥 Party Size: *${travelers} ${travelers === 1 ? 'Traveler' : 'Travelers'}* (${rooms} Room${rooms > 1 ? 's' : ''})`);
  lines.push(`🌤️ Travel Season: *${season}*`);
  if (trip.weather_info) {
    lines.push(`🌦️ Sensed Weather: *${trip.weather_info.temperature_c}°C • ${trip.weather_info.condition_label}*`);
    if (trip.is_rain_adaptive) {
      lines.push('☔ *Rain-Adaptive Mode:* Sheltered indoor attractions & palace halls active');
    }
  }
  lines.push(`🎭 Travel Style: *${trip.experience_preference.toUpperCase()}*`);
  lines.push('');
  lines.push('💰 *ESTIMATED EXPENSES:*');
  lines.push(`• Total Outlay: *₹${trip.budget.estimated_total_cost.toLocaleString('en-IN')}*`);
  lines.push(`• Cost per Person: *₹${perPerson.toLocaleString('en-IN')}*`);
  lines.push(`• Budget Status: ${trip.budget.is_within_budget ? '✅ Within Target' : '⚠️ Exceeds Target'}`);
  lines.push(`• Stay: ₹${trip.budget.cost_breakdown.accommodation.toLocaleString('en-IN')} | Food: ₹${trip.budget.cost_breakdown.food.toLocaleString('en-IN')} | Transit: ₹${trip.budget.cost_breakdown.transport.toLocaleString('en-IN')}`);

  if (trip.seasonal_insight) {
    lines.push(`\n🌤️ *SEASONAL CLIMATE PREDICTION:*`);
    lines.push(`• ${trip.seasonal_insight}`);
  }

  lines.push('\n🗺️ *DAY-WISE SCHEDULE:*');

  trip.days.forEach((day) => {
    lines.push(`\n*Day ${day.day_number}: ${day.destination_name}*`);
    lines.push(`▸ Morning: ${day.morning_activity.title}`);
    lines.push(`▸ Afternoon: ${day.afternoon_activity.title}`);
    lines.push(`▸ Evening: ${day.evening_activity.title}`);
    if (day.cuisine_recommendations && day.cuisine_recommendations.length > 0) {
      lines.push(`▸ Must-Eat: ${day.cuisine_recommendations.slice(0, 3).join(', ')}`);
    }
    if (day.travel_tip) {
      lines.push(`▸ Tip: ${day.travel_tip}`);
    }
  });

  if (trip.kannada_travel_phrases && trip.kannada_travel_phrases.length > 0) {
    lines.push('\n🗣️ *USEFUL KANNADA PHRASES:*');
    trip.kannada_travel_phrases.slice(0, 4).forEach((p) => {
      lines.push(`• "${p.phrase}" (${p.pronunciation}) = ${p.meaning}`);
    });
  }

  if (trip.validation_warnings && trip.validation_warnings.length > 0) {
    lines.push('\n⚠️ *TRAVEL ADVISORIES:*');
    trip.validation_warnings.slice(0, 2).forEach((w) => {
      lines.push(`• ${w}`);
    });
  }

  lines.push('\n━━━━━━━━━━━━━━━━━━━━');
  lines.push('✨ _Crafted with Karnataka Yatra AI_');
  lines.push(`Trip Reference: #${trip.trip_id}`);

  return lines.join('\n');
};

/**
 * Generates an encoded WhatsApp share URL that opens web or mobile WhatsApp
 */
export const getWhatsAppShareUrl = (trip: TripPlanResponse): string => {
  const text = formatWhatsAppItinerary(trip);
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
};

/**
 * Formats itinerary as standard Markdown for Notion, Docs, or Obsidian
 */
export const formatMarkdownItinerary = (trip: TripPlanResponse): string => {
  const lines: string[] = [];
  const travelers = trip.travelers_count || trip.budget.travelers_count || 1;
  const perPerson = trip.budget.per_person_cost || Math.round(trip.budget.estimated_total_cost / travelers);

  lines.push(`# ${trip.title}`);
  lines.push(`> **Trip ID:** \`${trip.trip_id}\` | **Origin:** ${trip.starting_city} | **Duration:** ${trip.duration_days} Days | **Season:** ${trip.travel_season || 'winter'} | **Travelers:** ${travelers}`);
  lines.push('');
  lines.push(`### Summary\n${trip.summary}\n`);

  if (trip.seasonal_insight) {
    lines.push(`### Seasonal Climate Prediction\n${trip.seasonal_insight}\n`);
  }

  lines.push('### Budget Overview');
  lines.push(`- **Requested Budget:** ₹${trip.budget.requested_budget.toLocaleString('en-IN')}`);
  lines.push(`- **Estimated Total:** ₹${trip.budget.estimated_total_cost.toLocaleString('en-IN')} (${trip.budget.is_within_budget ? 'Within Budget' : 'Exceeds Target'})`);
  lines.push(`- **Cost Per Traveler:** ₹${perPerson.toLocaleString('en-IN')}`);
  lines.push(`- **Rooms Allocated:** ${trip.budget.rooms_allocated || Math.ceil(travelers / 2)} double-occupancy room(s)`);
  lines.push(`- **Accommodation:** ₹${trip.budget.cost_breakdown.accommodation.toLocaleString('en-IN')}`);
  lines.push(`- **Food & Dining:** ₹${trip.budget.cost_breakdown.food.toLocaleString('en-IN')}`);
  lines.push(`- **Transport:** ₹${trip.budget.cost_breakdown.transport.toLocaleString('en-IN')}`);
  lines.push(`- **Activities & Entry:** ₹${trip.budget.cost_breakdown.activities_entry.toLocaleString('en-IN')}`);
  lines.push(`- **Contingency Reserve:** ₹${trip.budget.cost_breakdown.contingency_reserve.toLocaleString('en-IN')}`);
  lines.push('');

  lines.push('### Day-by-Day Itinerary');
  trip.days.forEach((day) => {
    lines.push(`\n#### Day ${day.day_number}: ${day.destination_name} - ${day.title}`);
    lines.push(`- **Morning (${day.morning_activity.time}):** **${day.morning_activity.title}**`);
    lines.push(`  - ${day.morning_activity.description}`);
    lines.push(`- **Afternoon (${day.afternoon_activity.time}):** **${day.afternoon_activity.title}**`);
    lines.push(`  - ${day.afternoon_activity.description}`);
    lines.push(`- **Evening (${day.evening_activity.time}):** **${day.evening_activity.title}**`);
    lines.push(`  - ${day.evening_activity.description}`);
    if (day.cuisine_recommendations && day.cuisine_recommendations.length > 0) {
      lines.push(`- **Local Food Highlights:** ${day.cuisine_recommendations.join(', ')}`);
    }
    if (day.travel_tip) {
      lines.push(`- **Logistics Tip:** ${day.travel_tip}`);
    }
  });

  if (trip.kannada_travel_phrases && trip.kannada_travel_phrases.length > 0) {
    lines.push('\n### Local Travel Phrasebook');
    trip.kannada_travel_phrases.forEach((p) => {
      lines.push(`- **${p.phrase}** (*${p.pronunciation}*): ${p.meaning} (${p.context})`);
    });
  }

  if (trip.validation_warnings && trip.validation_warnings.length > 0) {
    lines.push('\n### Travel Advisories');
    trip.validation_warnings.forEach((w) => lines.push(`- ⚠️ ${w}`));
  }

  lines.push('\n---\n*Generated by Karnataka Yatra AI — AI-Powered Personalized Travel Planner for Karnataka*');

  return lines.join('\n');
};

/**
 * Triggers a download of the trip plan as a formatted JSON file
 */
export const downloadTripJson = (trip: TripPlanResponse): void => {
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(trip, null, 2))}`;
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', jsonString);
  downloadAnchor.setAttribute('download', `karnataka-yatra-${trip.trip_id}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};
