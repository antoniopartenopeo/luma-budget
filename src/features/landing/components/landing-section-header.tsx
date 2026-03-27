import {
  LANDING_SECTION_DESCRIPTION_CLASS,
  LANDING_SECTION_EYEBROW_CLASS,
  LANDING_SECTION_TITLE_CLASS
} from "./landing-tokens"

interface LandingSectionHeaderProps {
  eyebrow: string
  title: string
  description: string
  titleId?: string
}

export function LandingSectionHeader({
  eyebrow,
  title,
  description,
  titleId
}: LandingSectionHeaderProps) {
  return (
    <div className="space-y-4 sm:space-y-5">
      <p className={LANDING_SECTION_EYEBROW_CLASS}>{eyebrow}</p>
      <div id={titleId} className={LANDING_SECTION_TITLE_CLASS}>
        {title}
      </div>
      <p className={`${LANDING_SECTION_DESCRIPTION_CLASS} pt-1`}>{description}</p>
    </div>
  )
}
