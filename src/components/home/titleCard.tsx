'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';
import { Button } from "../ui/buttons/Button";
import Link from "next/link";
import TypingText from "@/components/ui/typing-text";
import { ScrollButton } from "../ui/buttons/ScrollButton";
import Image from "next/image";
import cloudsImg from "./../../../public/clouds.png";
import rocketImg from "./../../../public/Rocket.png";

export default function TitleCard() {
    const heroRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ["start start", "end start"],
    });
    const prefersReducedMotion = useReducedMotion();
    const rocketParallaxY = useTransform(scrollYProgress, [0, 1], [0, prefersReducedMotion ? 0 : -300]);
    const rocketParallaxX = useTransform(scrollYProgress, [0, 1], [0, prefersReducedMotion ? 0 : 150]);

    return (
        <div
            ref={heroRef}
            className="relative flex items-center min-h-screen justify-center text-center px-8 sm:px-0 bg-linear-to-b from-blue-400 to-blue-100 overflow-hidden">

            {/* Rocket — outer handles parallax, inner handles entry */}
            <motion.div
                style={{ top: '8%', left: '50%', y: rocketParallaxY, x: rocketParallaxX }}
                className="absolute w-[100px] sm:w-[200px] will-change-transform"
            >
                <motion.div
                    initial={prefersReducedMotion ? false : { x: '-80vh', y: '80vh' }}
                    animate={{ x: 0, y: 0 }}
                    transition={{ duration: 3, ease: 'easeInOut' }}
                >
                    <Image
                        src={rocketImg}
                        alt="Rocket"
                        width={120}
                        height={200}
                        className="w-full h-auto rotate-45"
                        priority
                    />
                </motion.div>
            </motion.div>

            {/* Clouds */}
            <motion.div
                initial={prefersReducedMotion ? false : { x: '-100vw' }}
                animate={{ x: 0 }}
                transition={{ duration: 3, ease: 'easeInOut' }}
                className="absolute bottom-0 sm:bottom-auto sm:top-[45%] w-[300vw] md:w-[4000px] z-10 will-change-transform"
            >
                <Image
                    src={cloudsImg}
                    alt="Cloud"
                    width={4938}
                    height={1000}
                    className="w-full h-auto object-contain"
                    sizes="(max-width: 640px) 300vw, 140vw"
                    priority
                />
            </motion.div>

            <div className="absolute bottom-0 w-full bg-linear-to-t from-white to-transparent z-20 h-50"/>

            <div className="absolute top-0 left-0 w-full h-full bg-black/40"/>

            {/* Text content */}
            <motion.section
                initial={prefersReducedMotion ? false : { opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="flex h-full justify-center items-center w-full relative z-20"
            >
                <div className="max-w-2xl">
                    <TypingText
                        text={["IGNITE. ASCEND. TRANSCEND.", "MODEL. MACH. MANEUVER.", "PROPEL. PIONEER. PREVAIL.", "FUEL. FLIGHT. FUN."]}
                        typingSpeed={200}
                        pauseDuration={1500}
                        showCursor={true}
                        cursorCharacter=""
                        className="text-4xl font-bold text-white"
                        variableSpeed={{
                            min: 50,
                            max: 120,
                        }}
                    />
                    <p className="text-4xl text-yellow-400 mb-8">
                        Purdue Northwest ARCADE
                    </p>

                    <div className="flex justify-center gap-4">
                        <Button className="hover:text-black hover:bg-white text-xl p-6">
                            <Link href="https://mypnwlife.pnw.edu/ASME/club_signup">Join Us!</Link>
                        </Button>
                        <ScrollButton
                            variant="outline"
                            className="hover:text-white hover:bg-black text-xl p-6"
                            targetId="mission">
                            Learn More
                        </ScrollButton>
                    </div>
                </div>
            </motion.section>
        </div>
    );
}
