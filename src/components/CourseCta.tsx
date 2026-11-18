import { ArrowUpRight, BookOpen } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { NAII_URL } from '../data/personas'
import { NaiiStarMark } from './NaiiBrand'

/** CTA konversi ke www.naii.co + rekomendasi kursus. */
export function CourseCta({
  courses,
  heading,
}: {
  courses: string[]
  heading?: string
}) {
  const { lang } = useLanguage()
  const en = lang === 'en'
  const resolvedHeading = heading ?? (en ? 'Free Curriculum Recommendations at www.naii.co' : 'Rekomendasi Kurikulum Gratis www.naii.co')

  return (
    <div className="glass space-y-4 border-[#AD2B17]/30 p-6">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-[#AD2B17] dark:text-white">
          <BookOpen className="h-4 w-4" strokeWidth={1.75} />
          {resolvedHeading}
        </p>
        <NaiiStarMark color="#AD2B17" className="h-5 w-5 shrink-0" />
      </div>

      <ul className="space-y-2 border-y border-zinc-200/80 py-3.5 dark:border-white/10">
        {courses.map((c, idx) => (
          <li key={c} className="flex items-start gap-2.5 text-sm text-zinc-800 dark:text-zinc-200">
            <span className="mt-0.5 font-mono text-xs font-bold text-[#AD2B17] dark:text-white">0{idx + 1}</span>
            <span className="font-medium leading-snug">{c}</span>
          </li>
        ))}
      </ul>

      <a href={NAII_URL} target="_blank" rel="noreferrer" className="btn-primary w-full">
        {en ? 'Access 20+ Free Courses at www.naii.co' : 'Akses 20+ Kursus Gratis di www.naii.co'}
        <ArrowUpRight className="h-4 w-4" strokeWidth={1.75} />
      </a>
    </div>
  )
}
