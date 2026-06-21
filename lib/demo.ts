// Demo mode is toggled from the admin dashboard (Bio.demoMode field).
// When on, public pages serve lib/data.ts placeholder content instead of live DB data.
export {
  bio         as demoBio,
  contact     as demoContact,
  marqueeItems as demoMarqueeItems,
  skills      as demoSkills,
  projects    as demoProjects,
  experiences as demoExperiences,
} from './data'
