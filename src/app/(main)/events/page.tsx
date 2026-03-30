'use client'

import Image from "next/image";
import Link from "next/link";
import { useEvents } from "@/hooks/useEvents";

export default function EventsPage() {
    const { data: events, isLoading, error } = useEvents();

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Hero Section */}
            <section className="relative overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/events.png"
                        alt="Events Background"
                        fill
                        className="opacity-90 object-cover"
                    />
                    {/* Left gradient */}
                    <div className="absolute inset-y-0 left-0 w-64 bg-linear-to-r from-white to-transparent"></div>
                    {/* Right gradient */}
                    <div className="absolute inset-y-0 right-0 w-64 bg-linear-to-l from-white to-transparent"></div>
                    {/* Bottom gradient */}
                    <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-gray-100 to-transparent"></div>
                </div>

                {/* Hero Content */}
                <div className="relative z-10 pt-20 pb-16">
                    <div className="container mx-auto px-6 lg:px-12">
                        <div className="max-w-3xl">
                            <h1 className="text-5xl lg:text-7xl font-bold text-black mb-6 drop-shadow-2xl">
                                Events
                            </h1>
                            <p className="text-black text-lg mb-8 max-w-xl drop-shadow-lg leading-relaxed">
                                Join workshops, competitions, and networking sessions designed to enhance your engineering skills and connect you with industry professionals.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Events Grid Section */}
            <div className="container mx-auto px-6 lg:px-12 py-16">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                    Upcoming Events
                </h2>
                <p className="text-lg text-gray-600 mb-10">
                    Join us for workshops, competitions, and networking opportunities.
                </p>

                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
                    </div>
                ) : error ? (
                    <p className="text-red-500 text-center py-8">
                        Failed to load events. Please try again later.
                    </p>
                ) : !events?.length ? (
                    <p className="text-gray-500 text-center py-8">
                        No upcoming events at this time.
                    </p>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {events.map((event) => (
                            <Link
                                key={event.eventId}
                                href={event.eventUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                            >
                                <div className="relative h-48 w-full overflow-hidden">
                                    {event.eventPicture ? (
                                        <img
                                            src={event.eventPicture}
                                            alt={event.eventName}
                                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                                            <span className="text-gray-400 text-sm">No image available</span>
                                        </div>
                                    )}
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold mb-3 text-gray-800 group-hover:text-yellow-600 transition-colors">
                                        {event.eventName}
                                    </h3>
                                    <div className="space-y-2 mb-4">
                                        {event.eventDates && (
                                            <p className="text-sm text-gray-600 flex items-center gap-2">
                                                <span className="text-yellow-500">📅</span>
                                                {event.eventDates}
                                            </p>
                                        )}
                                        {event.eventLocation && (
                                            <p className="text-sm text-gray-600 flex items-center gap-2">
                                                <span className="text-yellow-500">📍</span>
                                                {event.eventLocation}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
