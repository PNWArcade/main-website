'use client'

import Link from "next/link";
import { useEvents } from "@/hooks/useEvents";
import { Button } from "@/components/ui/buttons/Button";

export default function HomeEvents() {
    const { data: events, isLoading, error } = useEvents(3);

    return (
        <div className="bg-gray-100 py-30 px-[15%]">
            <div>
                <h2 className="text-3xl font-bold text-center mb-8">Upcoming Events</h2>

                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
                    </div>
                ) : error ? (
                    <p className="text-red-500 text-center py-8">
                        Failed to load events.
                    </p>
                ) : !events?.length ? (
                    <p className="text-gray-500 text-center py-8">
                        No upcoming events at this time.
                    </p>
                ) : (
                    <div className={`grid gap-8 ${events.length === 1 ? 'grid-cols-1 max-w-md mx-auto' : events.length === 2 ? 'grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
                        {events.map((event) => (
                            <Link
                                key={event.eventId}
                                href={event.eventUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                            >
                                <div className="h-48 w-full overflow-hidden">
                                    {event.eventPicture ? (
                                        <img
                                            src={event.eventPicture}
                                            alt={event.eventName}
                                            className="object-cover w-full h-full"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                            <span className="text-gray-400 text-sm">No image available</span>
                                        </div>
                                    )}
                                </div>
                                <div className="p-6">
                                    <h2 className="text-xl font-semibold mb-2 text-gray-800">
                                        {event.eventName}
                                    </h2>
                                    {event.eventDates && (
                                        <p className="text-sm text-gray-500 mb-1">
                                            📅 {event.eventDates}
                                        </p>
                                    )}
                                    {event.eventLocation && (
                                        <p className="text-sm text-gray-500 mb-3">
                                            📍 {event.eventLocation}
                                        </p>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                <div className="flex justify-center mt-8">
                    <Link href="/events">
                        <Button
                            className="hover:bg-gray-300 hover:text-black"
                            variant="default"
                            size="lg"
                        >
                            View All Events
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
