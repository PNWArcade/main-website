import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faLinkedin, faGithub } from "@fortawesome/free-brands-svg-icons"
import { faEnvelope, faHandshake } from "@fortawesome/free-solid-svg-icons"
import Image, { StaticImageData } from "next/image"
import { cn } from "@/lib/utils"
import { FALLBACK_IMAGE } from "@/config/routes"

interface SocialLinks {
  email?: string
  linkedIn?: string
  handshake?: string
  gitHub?: string
}

interface TeamCardProps {
  image: string | StaticImageData
  name: string
  role: string
  major?: string
  bio?: string
  socialLinks?: SocialLinks
  className?: string
}

export const TeamCard: React.FC<TeamCardProps> = ({
  image,
  name,
  role,
  major,
  bio,
  socialLinks,
  className,
}) => {
  return (
    <article className={cn("lab-plate lift group flex h-full flex-col overflow-hidden rounded-2xl", className)}>
      <div className="relative h-64 overflow-hidden bg-muted">
        <Image
          src={image || FALLBACK_IMAGE}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, 25vw"
          className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
      </div>

      <div className="flex grow flex-col p-6">
        <h3 className="text-center text-xl font-semibold text-foreground">{name}</h3>
        <p className="mt-1 text-center font-mono text-xs tracking-[0.18em] text-purdue-gold uppercase">
          {role}
        </p>
        {major ? (
          <p className="mt-1 text-center text-xs text-muted-foreground">{major}</p>
        ) : null}
        {bio ? (
          <p className="mt-4 grow text-center text-sm leading-relaxed text-muted-foreground">
            {bio}
          </p>
        ) : null}

        {socialLinks && (
          <div className="mt-auto flex justify-center gap-2 border-t border-black/10 pt-4">
            {socialLinks.email && (
              <a
                href={`mailto:${socialLinks.email}`}
                aria-label={`Email ${name}`}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-black/5 text-muted-foreground hover:bg-purdue-gold hover:text-purdue-black"
              >
                <FontAwesomeIcon icon={faEnvelope} className="h-4 w-4" />
              </a>
            )}
            {socialLinks.handshake && (
              <a
                href={socialLinks.handshake}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${name} Handshake`}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-black/5 text-muted-foreground hover:bg-purdue-gold hover:text-purdue-black"
              >
                <FontAwesomeIcon icon={faHandshake} className="h-4 w-4" />
              </a>
            )}
            {socialLinks.linkedIn && (
              <a
                href={socialLinks.linkedIn}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${name} LinkedIn`}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-black/5 text-muted-foreground hover:bg-purdue-gold hover:text-purdue-black"
              >
                <FontAwesomeIcon icon={faLinkedin} className="h-4 w-4" />
              </a>
            )}
            {socialLinks.gitHub && (
              <a
                href={socialLinks.gitHub}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${name} GitHub`}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-black/5 text-muted-foreground hover:bg-purdue-gold hover:text-purdue-black"
              >
                <FontAwesomeIcon icon={faGithub} className="h-4 w-4" />
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  )
}
