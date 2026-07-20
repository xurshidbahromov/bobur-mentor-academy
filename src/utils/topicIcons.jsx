import {
  BookOpen, Rocket, Zap, Award, Gem, Flame, Sparkles, Target,
  Lightbulb, FlaskConical, Microscope, Globe, Brain, Star, Compass, GraduationCap,
  Calculator, Telescope, PenTool
} from 'lucide-react'

export const TOPIC_ICONS = {
  BookOpen, Rocket, Zap, Award, Gem, Flame, Sparkles, Target,
  Lightbulb, FlaskConical, Microscope, Globe, Brain, Star, Compass, GraduationCap,
  Calculator, Telescope, PenTool
}

export const PRESET_ICON_NAMES = Object.keys(TOPIC_ICONS)

export function TopicIcon({ name, ...props }) {
  const Icon = TOPIC_ICONS[name] || BookOpen
  return <Icon {...props} />
}
