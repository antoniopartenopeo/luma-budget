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
    <div className="space-y-3">
      <p className={LANDING_SECTION_EYEBROW_CLASS}>{eyebrow}</p>
      <span id={titleId} className={LANDING_SECTION_TITLE_CLASS}>
        {title}
      </span>
      <span className={LANDING_SECTION_DESCRIPTION_CLASS}>{description}</span>
    </div>
  )
}
