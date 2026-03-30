import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faLinkedin, faGithub} from "@fortawesome/free-brands-svg-icons";
import {faEnvelope, faHandshake} from "@fortawesome/free-solid-svg-icons";
import Image, {StaticImageData} from "next/image";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

interface SocialLinks {
    email?: string;
    linkedIn?: string;
    handshake?: string;
    gitHub?: string;
}

const teamCardVariants = cva(
    "flex flex-col rounded-lg shadow-md overflow-hidden max-w-sm transition-shadow duration-300 h-full",
    {
        variants: {
            variant: {
                default: "bg-white hover:shadow-xl",
                outlined: "bg-white border-2 border-gray-200 hover:border-purdue-gold hover:shadow-lg",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

interface TeamCardProps extends VariantProps<typeof teamCardVariants> {
    image : string | StaticImageData;
    name : string;
    role : string;
    major : string;
    bio : string;
    socialLinks?: SocialLinks;
    className?: string;
}

export const TeamCard : React.FC < TeamCardProps > = ({
    image,
    name,
    role,
    major,
    bio,
    socialLinks,
    variant,
    className
}) => {
    return (
        <div className={cn(teamCardVariants({ variant }), className)}>
            <div className="relative h-64 overflow-hidden bg-gray-200">
                <Image
                    src={image || "https://via.placeholder.com/400x400.png?text=ASME+Member"}
                    alt={name}
                    width={400}
                    height={400}
                    className="w-full h-full object-cover"/>
            </div>

            <div className="p-6 flex flex-col grow">
                <h3 className="text-2xl font-bold text-gray-900 mb-1 text-center">
                    {name}
                </h3>

                <p
                    className="text-indigo-600 font-semibold text-sm uppercase tracking-wide text-center">
                    {role}
                </p>
                <p
                    className="text-sky-500 font-medium text-xs uppercase tracking-wide mb-3 text-center">
                    {major}
                </p>

                <p className="text-gray-600 text-sm leading-relaxed mb-4 text-center grow">
                    {bio}
                </p>

                {socialLinks && (
                    <div
                        className="flex justify-center gap-3 pt-4 border-t border-gray-200 mt-auto">
                        {socialLinks.email && (
                            <a
                                href={`mailto:${socialLinks.email}`}
                                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-rose-600 flex items-center justify-center transition-colors group">
                                <FontAwesomeIcon
                                    icon={faEnvelope}
                                    className="w-4 h-4 text-gray-600 group-hover:text-white"/>
                            </a>
                        )}
                        {socialLinks.handshake && (
                            <a
                                href={socialLinks.handshake}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-amber-600 flex items-center justify-center transition-colors group">
                                <FontAwesomeIcon
                                    icon={faHandshake}
                                    className="w-4 h-4 text-gray-600 group-hover:text-white"/>
                            </a>
                        )}
                        {socialLinks.linkedIn && (
                            <a
                                href={socialLinks.linkedIn}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-blue-600 flex items-center justify-center transition-colors group">
                                <FontAwesomeIcon
                                    icon={faLinkedin}
                                    className="w-4 h-4 text-gray-600 group-hover:text-white"/>
                            </a>
                        )}
                        {socialLinks.gitHub && (
                            <a
                                href={socialLinks.gitHub}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-800 flex items-center justify-center transition-colors group">
                                <FontAwesomeIcon
                                    icon={faGithub}
                                    className="w-4 h-4 text-gray-600 group-hover:text-white"/>
                            </a>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
