import {Button} from "../ui/buttons/Button";
import Link from "next/link";
import TypingText from "@/components/ui/typing-text";
import {ScrollButton} from "../ui/buttons/ScrollButton";

export default function TitleCard() {
    return (
        <div
            className="relative items-center h-[calc(100vh-5rem)] justify-center text-center px-8 sm:px-0">
            {/* Video Background */}
            <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute top-0 left-0 w-full h-full object-cover brightness-75 z-0">
                <source src="/video.mp4" type="video/mp4"/>
            </video>

            {/* Overlay for better text readability */}
            <div className="absolute top-0 left-0 w-full h-full bg-black/50 z-10"/> {/* Content */}
            <div className="pb-20 h-full">
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
                            Purdue Northwest ASME Student Chapter
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
        </div>
    );
}
