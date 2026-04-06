import {Button} from "../ui/buttons/Button";
import Link from "next/link";
import TypingText from "@/components/ui/typing-text";
import {ScrollButton} from "../ui/buttons/ScrollButton";
import Image from "next/image";
import cloudsImg from "./../../../public/clouds.png";
import rocketImg from "./../../../public/ROcket.png";

export default function TitleCard() {
    return (
        <div
            className="relative flex items-center min-h-screen justify-center text-center px-8 sm:px-0 bg-linear-to-b from-blue-400 to-blue-100 overflow-hidden">
                <style>{`
                    @keyframes cloudDrift {
                        0% {
                            transform: translateX(-100vw);
                        }
                        100% {
                            transform: translateX(0);
                        }
                    }
                    .cloud-drift {
                        animation: cloudDrift ease-in-out 3s forwards;
                    }
                    @keyframes rocketShoot {
                        0% {
                            transform: translateX(-100px) translateY(0);
                            opacity: 1;
                        }
                        100% {
                            transform: translateX(50vw) translateY(-50vh);
                            opacity: 1;
                        }
                    }
                    .rocket-shoot {
                        animation: rocketShoot 5s ease-in forwards;
                    }
                `}</style>

                {/* One Big Cloud */}
                <div
                    className="absolute cloud-drift"
                    style={{
                        top: "45%",
                        width: "140vw",
                        height: "auto",
                        zIndex: 5,
                    }}
                >
                    <Image
                        src={cloudsImg}
                        alt="Cloud"
                        width={4938}
                        height={1000}
                        className="w-full h-auto object-contain"
                        priority
                    />
                </div>

                {/* Rocket */}
                <div
                    className="absolute rocket-shoot"
                    style={{
                        width: "600px",
                        height: "auto",
                        zIndex: 30,
                        left: "0",
                        bottom: "0",
                    }}
                >
                    <Image
                        src={rocketImg}
                        alt="Rocket"
                        width={120}
                        height={200}
                        className="w-full h-auto"
                    />
                </div>

                <div className="absolute bottom-0 w-full bg-linear-to-t to-transparent z-20 h-50"/>

            {/* Overlay for better text readability */}
            <div className="absolute top-0 left-0 w-full h-full bg-black/20 z-10 "/>
            <section
                className="flex h-full justify-center items-center w-full relative z-20 ">
                <div className="max-w-2xl">
                        <TypingText
                            text={["DESIGN. BUILD. INSPIRE.", "THINK. SOLVE. ACHIEVE.", "INNOVATE. COLLABORATE. LEAD."]}
                            typingSpeed={200}
                            pauseDuration={1500}
                            showCursor={true}
                            cursorCharacter=""
                            className="text-4xl font-bold text-white"
                            variableSpeed={{
                            min: 50,
                            max: 120
                        }}/>
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
                </section>
        </div>
    );
}
