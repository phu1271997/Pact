export interface PactTemplate {
  id: string;
  title: string;
  category: string;
  verification_platform: string;
  placeholder_url: string;
  success_criteria_template: string;
  icon: string;
}

export const TEMPLATES: PactTemplate[] = [
  {
    id: "run-streak",
    title: "Run 100km this month",
    category: "fitness",
    verification_platform: "Strava",
    placeholder_url: "https://www.strava.com/athletes/YOUR_ID",
    success_criteria_template: "Total running distance >= 100km between {start} and {end}",
    icon: "🏃",
  },
  {
    id: "code-streak",
    title: "Commit code every day",
    category: "coding",
    verification_platform: "GitHub",
    placeholder_url: "https://github.com/YOUR_USERNAME",
    success_criteria_template: "At least 1 public commit per day for {duration} days",
    icon: "💻",
  },
  {
    id: "writing-streak",
    title: "Publish 30 blog posts",
    category: "writing",
    verification_platform: "Medium / Substack",
    placeholder_url: "https://medium.com/@YOUR_USERNAME",
    success_criteria_template: "Publish minimum {count} blog posts between {start} and {end}",
    icon: "✍️",
  },
  {
    id: "language-learning",
    title: "Learn Spanish daily",
    category: "learning",
    verification_platform: "Duolingo",
    placeholder_url: "https://www.duolingo.com/profile/YOUR_USERNAME",
    success_criteria_template: "Maintain Duolingo streak of {duration} days",
    icon: "🌍",
  },
  {
    id: "youtube-creator",
    title: "Upload 10 YouTube videos",
    category: "creative",
    verification_platform: "YouTube",
    placeholder_url: "https://www.youtube.com/@YOUR_CHANNEL",
    success_criteria_template: "Upload {count} public videos by {deadline}",
    icon: "🎬",
  },
  {
    id: "reading-challenge",
    title: "Read 12 books this year",
    category: "learning",
    verification_platform: "Goodreads",
    placeholder_url: "https://www.goodreads.com/user/show/YOUR_ID",
    success_criteria_template: "Mark {count} books as 'read' on Goodreads",
    icon: "📚",
  },
];
